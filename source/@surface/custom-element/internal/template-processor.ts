import { Action, Indexer } from "@surface/core";
import { assert }          from "@surface/core/common/generic";
import IDisposable         from "@surface/core/interfaces/disposable";
import IArrayExpression    from "@surface/expression/interfaces/array-expression";
import IExpression         from "@surface/expression/interfaces/expression";
import TypeGuard           from "@surface/expression/internal/type-guard";
import ISubscription       from "@surface/reactive/interfaces/subscription";
import Type                from "@surface/reflection";
import FieldInfo           from "@surface/reflection/field-info";
import
{
    classMap,
    createScope,
    styleMap,
    throwTemplateEvaluationError
}
from "./common";
import DataBind                 from "./data-bind";
import directiveRegistry        from "./directive-registry";
import ChoiceDirectiveHandler   from "./directives/template-handlers/choice-directive-handler";
import InjectorDirectiveHandler from "./directives/template-handlers/injector-directive-handler";
import LoopDirectiveHandler     from "./directives/template-handlers/loop-directive-handler";
import TemplateProcessError     from "./errors/template-process-error";
import IAttributeDescriptor     from "./interfaces/attribute-descriptor";
import IDirective               from "./interfaces/directive";
import IDirectivesDescriptor    from "./interfaces/directives-descriptor";
import ITemplateDescriptor      from "./interfaces/template-descriptor";
import ITextNodeDescriptor      from "./interfaces/text-node-descriptor";
import ITraceable               from "./interfaces/traceable";
import TemplateMetadata         from "./metadata/template-metadata";
import { Scope }                from "./types";

interface ITemplateProcessorData
{
    descriptor: ITemplateDescriptor;
    host:       Node|Element;
    root:       Node;
    scope:      Scope;
    context?:   Node;
}

interface ITemplateDirectivesData
{
    directives: IDirectivesDescriptor;
    scope:      Scope;
    context?:   Node;
}

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Array<Action>> = new Map();

    private readonly descriptor: ITemplateDescriptor;
    private readonly host:       Node;
    private readonly lookup:     Record<string, Element>;


    private constructor(data: ITemplateProcessorData)
    {
        this.host       = data.host;
        this.descriptor = data.descriptor;

        this.lookup = this.buildLookup(data.root, data.descriptor.lookup);
    }

    public static process(data: ITemplateProcessorData): IDisposable
    {
        /* istanbul ignore if */
        if (TemplateProcessor.postProcessing.has(data.host))
        {
            TemplateProcessor.postProcessing.get(data.host)!.forEach(action => action());

            TemplateProcessor.postProcessing.delete(data.host);
        }

        return new TemplateProcessor(data).process(data.scope, data.context);
    }

    private buildLookup(node: Node, source: Array<Array<number>>): Record<string, Element>
    {
        const lookup: Record<string, Element> = { };

        for (const entry of source)
        {
            if (entry.length > 0)
            {
                lookup[entry.join("-")] = this.findElement(node, entry) as Element;
            }
            else
            {
                lookup[""] = node as Element;
            }
        }

        return lookup;
    }

    private buildStack(traceable: ITraceable): string
    {
        return traceable.stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
    }

    private findElement(node: Node, indexes: Array<number>): Node
    {
        const [index, ...remaining] = indexes;

        const child = node.childNodes[index];

        if (remaining.length > 0)
        {
            return this.findElement(child, remaining);
        }

        return child;
    }

    private process(scope: Scope, context?: Node): IDisposable
    {
        const subscriptions: Array<ISubscription> = [];
        const disposables:   Array<IDisposable>   = [];

        for (const descriptor of this.descriptor.elements)
        {
            const element = this.lookup[descriptor.path];

            const localScope = createScope({ this: element.nodeType == Node.DOCUMENT_FRAGMENT_NODE && context ? context : element, ...scope });

            subscriptions.push(...this.processAttributes(localScope, element, descriptor.attributes));
            disposables.push(...this.processElementDirectives(localScope, element, descriptor.directives));
            subscriptions.push(...this.processTextNode(localScope, descriptor.textNodes));

            element.dispatchEvent(new Event("bind"));
        }

        disposables.push(this.processTemplateDirectives({ scope: createScope(scope), context, directives: this.descriptor.directives }));

        return {
            dispose: () =>
            {
                subscriptions.splice(0).forEach(x => x.unsubscribe());
                disposables.splice(0).forEach(x => x.dispose());
            }
        };
    }

    private processAttributes(scope: Scope, element: Element, attributeDescriptors: Array<IAttributeDescriptor>): Array<ISubscription>
    {
        const constructor = window.customElements.get(element.localName);

        /* istanbul ignore next */
        const processor = constructor && !(element instanceof constructor)
            ? TemplateProcessor.postProcessing.get(element) ?? TemplateProcessor.postProcessing.set(element, []).get(element)!
            : null;

        const subscriptions: Array<ISubscription> = [];

        for (const descriptor of attributeDescriptors)
        {
            const action = () =>
            {
                if (descriptor.type == "oneway" || descriptor.type == "twoway")
                {
                    const elementMember = Type.from(element).getMember(descriptor.key);

                    if (elementMember instanceof FieldInfo && elementMember.readonly)
                    {
                        throw new TemplateProcessError(`Property ${descriptor.key} of <${element.nodeName.toLowerCase()}> is readonly`, this.buildStack(descriptor));
                    }

                    if (descriptor.type == "oneway")
                    {
                        let notify: Action;

                        if (descriptor.name == "class" || descriptor.name == "style")
                        {
                            const attribute = document.createAttribute(descriptor.name);

                            element.setAttributeNode(attribute);

                            notify = descriptor.name == "class"
                                ? () => attribute.value = classMap(this.tryEvaluate(descriptor.expression, scope, descriptor.stackTrace) as Record<string, boolean>)
                                : () => attribute.value = styleMap(this.tryEvaluate(descriptor.expression, scope, descriptor.stackTrace) as Record<string, boolean>);
                        }
                        else
                        {
                            notify = () => (element as unknown as Indexer)[descriptor.key] = this.tryEvaluate(descriptor.expression, scope, descriptor.stackTrace);
                        }

                        let subscription = DataBind.observe(scope, descriptor.observables, { notify }, true);

                        notify();

                        subscriptions.push(subscription);
                    }
                    else
                    {
                        assert(TypeGuard.isMemberExpression(descriptor.expression));

                        const target         = this.tryEvaluate(descriptor.expression.object, scope, descriptor.stackTrace) as object;
                        const targetProperty = TypeGuard.isIdentifier(descriptor.expression.property)
                            ? descriptor.expression.property.name
                            : descriptor.expression.property.evaluate(scope) as string;

                        const targetMember = Type.from(target).getMember(targetProperty);

                        if (targetMember instanceof FieldInfo && targetMember.readonly)
                        {
                            const rawExpression = descriptor.expression.toString();

                            element.setAttribute(`::${descriptor.name}`, rawExpression);

                            throw new TemplateProcessError(`Property ${targetProperty} of ${target.constructor.name} is readonly in ::"${descriptor.name}='${rawExpression}'"`, this.buildStack(descriptor));
                        }

                        subscriptions.push(...DataBind.twoWay(target, targetProperty, element, descriptor.key));
                    }
                }
                else
                {
                    const attribute = element.attributes.getNamedItem(descriptor.name)!;

                    const notify = () => attribute.value = `${(descriptor.expression.evaluate(scope) as Array<unknown>).reduce((previous, current) => `${previous}${current}`)}`;

                    let subscription = DataBind.observe(scope, descriptor.observables, { notify }, true);

                    subscriptions.push(subscription);

                    notify();
                }
            };

            /* istanbul ignore else */
            if (!processor)
            {
                action();
            }
            else
            {
                processor.push(action);
            }
        }

        return subscriptions;
    }

    private processElementDirectives(scope: Scope, element: Element, directives: Array<IDirective>): Array<IDisposable>
    {
        const disposables: Array<IDisposable> = [];

        for (const directive of directives)
        {
            const handlerConstructor = directiveRegistry.get(directive.name)!;

            disposables.push(new handlerConstructor(scope, element, directive));
        }

        return disposables;
    }

    private processTemplateDirectives(data: ITemplateDirectivesData): IDisposable
    {
        const disposables: Array<IDisposable> = [];

        for (const directive of data.directives.inject)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = data.context ?? template.parentNode;

            const metadata = TemplateMetadata.from(currentContext);

            template.remove();

            const key = `${directive.key.evaluate(data.scope)}`;

            const action = metadata.injectors.get(key);

            if (action)
            {
                action(data.scope, currentContext, this.host, template, directive);
            }
            else
            {
                template.remove();

                metadata.injections.set(key, { scope: data.scope, template, directive, context: currentContext, host: this.host });
            }

            disposables.push({ dispose: () => (metadata.injections.delete(key), metadata.defaults.get(key)!()) });
        }

        for (const directive of data.directives.logical)
        {
            const templates = directive.branches.map(x => this.lookup[x.path]) as Array<HTMLTemplateElement>;

            assert(templates[0].parentNode);

            const currentContext = data.context ?? templates[0].parentNode;

            disposables.push(new ChoiceDirectiveHandler(data.scope, currentContext, this.host, templates, directive.branches));
        }

        for (const directive of data.directives.loop)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = data.context ?? template.parentNode;

            disposables.push(new LoopDirectiveHandler(data.scope, currentContext, this.host, template, directive));
        }

        for (const directive of data.directives.injector)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = data.context ?? template.parentNode;

            disposables.push(new InjectorDirectiveHandler(data.scope, currentContext, this.host, template, directive));
        }

        return { dispose: () => disposables.splice(0).forEach(disposable => disposable.dispose()) };
    }

    private processTextNode(scope: Scope, descriptors: Array<ITextNodeDescriptor>): Array<ISubscription>
    {
        const subscriptions: Array<ISubscription> = [];

        for (const descriptor of descriptors)
        {
            const node = this.lookup[descriptor.path];

            const notify = () => node.nodeValue = `${(this.tryEvaluate(descriptor.expression, scope, descriptor.stackTrace, true) as Array<unknown>).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = DataBind.observe(scope, descriptor.observables, { notify }, true);

            subscriptions.push(subscription);

            notify();
        }

        return subscriptions;
    }

    private tryEvaluate(expression: IExpression, scope: Scope, stackTrace: Array<Array<string>>, isTextNode?: boolean): unknown
    {
        try
        {
            return expression.evaluate(scope);
        }
        catch (error)
        {
            assert(error instanceof Error);

            let rawExpression: string;

            if (isTextNode)
            {
                rawExpression = (expression as IArrayExpression).elements.map(x => (x as IExpression).toString()).join("");
            }
            else
            {
                rawExpression = expression.toString();
            }

            throwTemplateEvaluationError(`Error evaluating "${rawExpression}" - ${error.message}`, stackTrace);
        }
    }
}