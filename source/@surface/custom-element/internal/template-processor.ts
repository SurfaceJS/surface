import { Action, Indexer } from "@surface/core";
import { assert }          from "@surface/core/common/generic";
import IDisposable         from "@surface/core/interfaces/disposable";
import TypeGuard           from "@surface/expression/internal/type-guard";
import ISubscription       from "@surface/reactive/interfaces/subscription";
import Type                from "@surface/reflection";
import FieldInfo           from "@surface/reflection/field-info";
import
{
    classMap,
    createScope,
    styleMap
}
from "./common";
import DataBind                 from "./data-bind";
import directiveRegistry        from "./directive-registry";
import ChoiceDirectiveHandler   from "./directives/template-handlers/choice-directive-handler";
import InjectorDirectiveHandler from "./directives/template-handlers/injector-directive-handler";
import LoopDirectiveHandler     from "./directives/template-handlers/loop-directive-handler";
import IAttributeDescriptor     from "./interfaces/attribute-descriptor";
import IDirective               from "./interfaces/directive";
import IDirectivesDescriptor    from "./interfaces/directives-descriptor";
import ITemplateDescriptor      from "./interfaces/template-descriptor";
import ITextNodeDescriptor      from "./interfaces/text-node-descriptor";
import TemplateMetadata         from "./metadata/template-metadata";
import { Scope }                from "./types";

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Array<Action>> = new Map();

    private readonly descriptor: ITemplateDescriptor;
    private readonly host:       Node;
    private readonly lookup:     Record<string, Element>;

    private constructor(host: Node|Element, root: Node, descriptor: ITemplateDescriptor)
    {
        this.host       = host;
        this.descriptor = descriptor;

        this.lookup = this.buildLookup(root, descriptor.lookup);
    }

    public static process(scope: Scope, context: Node|null, host: Node|Element, node: Node, descriptor: ITemplateDescriptor): IDisposable
    {
        /* istanbul ignore if */
        if (TemplateProcessor.postProcessing.has(host))
        {
            TemplateProcessor.postProcessing.get(host)!.forEach(action => action());

            TemplateProcessor.postProcessing.delete(host);
        }

        return new TemplateProcessor(host, node, descriptor).process(scope, context);
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


    private process(scope: Scope, context: Node|null): IDisposable
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

        disposables.push(this.processTemplateDirectives(createScope(scope), context, this.descriptor.directives, this.lookup));

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
                        throw new Error(`Property ${descriptor.key} of ${element.constructor.name} is readonly`);
                    }

                    if (descriptor.type == "oneway")
                    {
                        let notify: Action;

                        if (descriptor.name == "class" || descriptor.name == "style")
                        {
                            const attribute = document.createAttribute(descriptor.name);

                            element.setAttributeNode(attribute);

                            notify = descriptor.name == "class"
                                ? () => attribute.value = classMap(descriptor.expression.evaluate(scope) as Record<string, boolean>)
                                : () => attribute.value = styleMap(descriptor.expression.evaluate(scope) as Record<string, boolean>);
                        }
                        else
                        {
                            notify = () => (element as Indexer)[descriptor.key] = descriptor.expression.evaluate(scope);
                        }

                        let subscription = DataBind.observe(scope, descriptor.observables, { notify }, true);

                        notify();

                        subscriptions.push(subscription);
                    }
                    else
                    {
                        assert(TypeGuard.isMemberExpression(descriptor.expression));

                        const target         = descriptor.expression.object.evaluate(scope) as object;
                        const targetProperty = TypeGuard.isIdentifier(descriptor.expression.property)
                            ? descriptor.expression.property.name
                            : descriptor.expression.property.evaluate(scope) as string;

                        const targetMember = Type.from(target).getMember(targetProperty);

                        if (targetMember instanceof FieldInfo && targetMember.readonly)
                        {
                            throw new Error(`Property ${targetProperty} of ${target.constructor.name} is readonly`);
                        }

                        subscriptions.push(...DataBind.twoWay(target, targetProperty, element as Indexer, descriptor.key));
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

    private processTemplateDirectives(scope: Scope, context: Node|null, directives: IDirectivesDescriptor, lookup: Record<string, Element>): IDisposable
    {
        const disposables: Array<IDisposable> = [];

        for (const directive of directives.inject)
        {
            const template = lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = context ?? template.parentNode;

            const metadata = TemplateMetadata.from(currentContext);

            template.remove();

            const key = `${directive.key.evaluate(scope)}`;

            const action = metadata.injectors.get(key);

            if (action)
            {
                action(scope, currentContext, this.host, template, directive);
            }
            else
            {
                template.remove();

                metadata.injections.set(key, { scope, template, directive, context: currentContext, host: this.host });
            }

            disposables.push({ dispose: () => (metadata.injections.delete(key), metadata.defaults.get(key)!()) });
        }

        for (const directive of directives.logical)
        {
            const templates = directive.branches.map(x => lookup[x.path]) as Array<HTMLTemplateElement>;

            assert(templates[0].parentNode);

            const currentContext = context ?? templates[0].parentNode;

            disposables.push(new ChoiceDirectiveHandler(scope, currentContext, this.host, templates, directive.branches));
        }

        for (const directive of directives.loop)
        {
            const template = lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = context ?? template.parentNode;

            disposables.push(new LoopDirectiveHandler(scope, currentContext, this.host, template, directive));
        }

        for (const directive of directives.injector)
        {
            const template = lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = context ?? template.parentNode;

            disposables.push(new InjectorDirectiveHandler(scope, currentContext, this.host, template, directive));
        }

        return { dispose: () => disposables.splice(0).forEach(disposable => disposable.dispose()) };
    }

    private processTextNode(scope: Scope, descriptors: Array<ITextNodeDescriptor>): Array<ISubscription>
    {
        const subscriptions: Array<ISubscription> = [];

        for (const descriptor of descriptors)
        {
            const node = this.lookup[descriptor.path];

            const notify = () => node.nodeValue = `${(descriptor.expression.evaluate(scope) as Array<unknown>).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = DataBind.observe(scope, descriptor.observables, { notify }, true);

            subscriptions.push(subscription);

            notify();
        }

        return subscriptions;
    }


}