import { Delegate, IDisposable, Indexer, assert, typeGuard } from "@surface/core";
import { TypeGuard }                                         from "@surface/expression";
import { ISubscription }                                     from "@surface/reactive";
import Type, { FieldInfo }                                   from "@surface/reflection";
import
{
    classMap,
    createScope,
    styleMap,
    tryEvaluateExpression,
    tryEvaluateExpressionByTraceable,
    tryObserveByObservable,
} from "./common";
import DataBind                    from "./data-bind";
import directiveRegistry           from "./directive-registry";
import EventDirectiveHandler       from "./directives/handlers/event-directive-handler";
import ChoiceDirectiveHandler      from "./directives/template-handlers/choice-directive-handler";
import InjectDirectiveHandler      from "./directives/template-handlers/inject-directive-handler";
import LoopDirectiveHandler        from "./directives/template-handlers/loop-directive-handler";
import PlaceholderDirectiveHandler from "./directives/template-handlers/placeholder-directive-handler";
import TemplateProcessError        from "./errors/template-process-error";
import IAttributeDirective         from "./interfaces/attribute-directive";
import ICustomDirective            from "./interfaces/custom-directive";
import IDirectivesDescriptor       from "./interfaces/directives-descriptor";
import IEventDirective             from "./interfaces/event-directive";
import ITemplateDescriptor         from "./interfaces/template-descriptor";
import ITextNodeDescriptor         from "./interfaces/text-node-descriptor";
import ITraceable                  from "./interfaces/traceable";
import { DirectiveHandlerFactory } from "./types";

interface ITemplateProcessorData
{
    descriptor: ITemplateDescriptor;
    host:       Node | Element;
    root:       Node;
    scope:      object;
    context?:   Node;
}

interface ITemplateDirectivesData
{
    directives: IDirectivesDescriptor;
    scope:      object;
    context?:   Node;
}

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Delegate[]> = new Map();

    private readonly descriptor: ITemplateDescriptor;
    private readonly host:       Node;
    private readonly lookup:     Record<string, Node>;

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

    private buildLookup(node: Node, source: number[][]): Record<string, Node>
    {
        const lookup: Record<string, Node> = { };

        for (const entry of source)
        {
            if (entry.length > 0)
            {
                lookup[entry.join("-")] = this.findElement(node, entry);
            }
            else
            {
                lookup[""] = node;
            }
        }

        return lookup;
    }

    private buildStack(traceable: ITraceable): string
    {
        return traceable.stackTrace.map((entry, i) => entry.map(value => "   ".repeat(i) + value).join("\n")).join("\n");
    }

    private findElement(node: Node, indexes: number[]): Node
    {
        const [index, ...remaining] = indexes;

        const child = node.childNodes[index];

        if (remaining.length > 0)
        {
            return this.findElement(child, remaining);
        }

        return child;
    }

    private process(scope: object, context?: Node): IDisposable
    {
        const subscriptions: ISubscription[] = [];
        const disposables:   IDisposable[]   = [];

        for (const descriptor of this.descriptor.elements)
        {
            const element = this.lookup[descriptor.path] as HTMLElement;

            const localScope = createScope({ this: element.nodeType == Node.DOCUMENT_FRAGMENT_NODE && context ? context : element, ...scope });

            subscriptions.push(...this.processAttributes(localScope, element, descriptor.attributes));
            disposables.push(...this.processEvents(localScope, element, descriptor.events));
            disposables.push(...this.processElementDirectives(localScope, element, descriptor.directives));
            subscriptions.push(...this.processTextNode(localScope, descriptor.textNodes));

            element.dispatchEvent(new Event("bind"));
        }

        disposables.push(this.processTemplateDirectives({ context, directives: this.descriptor.directives, scope: createScope(scope) }));

        return {
            dispose: () =>
            {
                subscriptions.splice(0).forEach(x => x.unsubscribe());
                disposables.splice(0).forEach(x => x.dispose());
            },
        };
    }

    private processAttributes(scope: object, element: Element, attributeDescriptors: IAttributeDirective[]): ISubscription[]
    {
        const constructor = window.customElements.get(element.localName);

        let processor: Delegate[] | undefined;

        if (constructor && !(element instanceof constructor))
        {
            TemplateProcessor.postProcessing.set(element, processor = []);
        }

        const subscriptions: ISubscription[] = [];

        for (const descriptor of attributeDescriptors)
        {
            const action = (): void =>
            {
                if (descriptor.type == "oneway" || descriptor.type == "twoway")
                {
                    const elementMember = Type.from(element).getMember(descriptor.key);

                    if (elementMember instanceof FieldInfo && elementMember.readonly)
                    {
                        const message = `Binding error in ${descriptor.rawExpression}: Property "${descriptor.key}" of <${element.nodeName.toLowerCase()}> is readonly`;

                        throw new TemplateProcessError(message, this.buildStack(descriptor));
                    }

                    if (descriptor.type == "oneway")
                    {
                        let notify: Delegate;

                        if (descriptor.name == "class" || descriptor.name == "style")
                        {
                            const attribute = document.createAttribute(descriptor.name);

                            element.setAttributeNode(attribute);

                            notify = descriptor.name == "class"
                                ? () => attribute.value = classMap(tryEvaluateExpressionByTraceable(scope, descriptor) as Record<string, boolean>)
                                : () => attribute.value = styleMap(tryEvaluateExpressionByTraceable(scope, descriptor) as Record<string, boolean>);
                        }
                        else
                        {
                            notify = () => (element as object as Indexer)[descriptor.key] = tryEvaluateExpressionByTraceable(scope, descriptor);
                        }

                        const subscription = tryObserveByObservable(scope, descriptor, { notify }, true);

                        notify();

                        subscriptions.push(subscription);
                    }
                    else
                    {
                        assert(TypeGuard.isMemberExpression(descriptor.expression));

                        const target         = tryEvaluateExpression(scope, descriptor.expression.object, descriptor.rawExpression, descriptor.stackTrace) as object;
                        const targetProperty = TypeGuard.isIdentifier(descriptor.expression.property)
                            ? descriptor.expression.property.name
                            : descriptor.expression.property.evaluate(scope) as string;

                        const targetMember = Type.from(target).getMember(targetProperty);

                        if (!targetMember || targetMember instanceof FieldInfo && targetMember.readonly)
                        {
                            const message = targetMember
                                ? `Binding error in ${descriptor.rawExpression}: Property "${targetProperty}" of ${target.constructor.name} is readonly`
                                : `Binding error in ${descriptor.rawExpression}: Property "${targetProperty}" does not exists on type ${target.constructor.name}`;

                            throw new TemplateProcessError(message, this.buildStack(descriptor));
                        }

                        subscriptions.push(...DataBind.twoWay(target, targetProperty, element, descriptor.key));
                    }
                }
                else
                {
                    const attribute = element.attributes.getNamedItem(descriptor.name)!;

                    const notify = (): string => attribute.value = `${(tryEvaluateExpressionByTraceable(scope, descriptor) as unknown[]).reduce((previous, current) => `${previous}${current}`)}`;

                    const subscription = tryObserveByObservable(scope, descriptor, { notify }, true);

                    subscriptions.push(subscription);

                    notify();
                }
            };

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

    private processElementDirectives(scope: object, element: HTMLElement, directives: ICustomDirective[]): IDisposable[]
    {
        const disposables: IDisposable[] = [];

        for (const directive of directives)
        {
            const handlerConstructor = directiveRegistry.get(directive.name);

            if (!handlerConstructor)
            {
                throw new TemplateProcessError(`Unregistered directive #${directive.name}.`, this.buildStack(directive));
            }

            if (typeGuard<DirectiveHandlerFactory>(handlerConstructor, !handlerConstructor.prototype))
            {
                disposables.push(handlerConstructor(scope, element, directive));
            }
            else
            {
                disposables.push(new handlerConstructor(scope, element, directive));
            }
        }

        return disposables;
    }

    private processEvents(localScope: object, element: HTMLElement, events: IEventDirective[]): IDisposable[]
    {
        const disposables: IDisposable[] = [];

        for (const directive of events)
        {
            disposables.push(new EventDirectiveHandler(localScope, element, directive));
        }

        return disposables;
    }

    private processTemplateDirectives(data: ITemplateDirectivesData): IDisposable
    {
        const disposables: IDisposable[] = [];

        for (const directive of data.directives.injections)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = template.parentNode;

            disposables.push(new InjectDirectiveHandler(data.scope, currentContext, this.host, template, directive));
        }

        for (const directive of data.directives.logicals)
        {
            const templates = directive.branches.map(x => this.lookup[x.path]) as HTMLTemplateElement[];

            assert(templates[0].parentNode);

            const currentContext = data.context ?? templates[0].parentNode;

            disposables.push(new ChoiceDirectiveHandler(data.scope, currentContext, this.host, templates, directive.branches));
        }

        for (const directive of data.directives.loops)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = data.context ?? template.parentNode;

            disposables.push(new LoopDirectiveHandler(data.scope, currentContext, this.host, template, directive));
        }

        for (const directive of data.directives.placeholders)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const currentContext = data.context ?? template.parentNode;

            disposables.push(new PlaceholderDirectiveHandler(data.scope, currentContext, this.host, template, directive));
        }

        return { dispose: () => disposables.splice(0).forEach(disposable => disposable.dispose()) };
    }

    private processTextNode(scope: object, descriptors: ITextNodeDescriptor[]): ISubscription[]
    {
        const subscriptions: ISubscription[] = [];

        for (const descriptor of descriptors)
        {
            const node = this.lookup[descriptor.path];

            const notify = (): string => node.nodeValue = `${(tryEvaluateExpressionByTraceable(scope, descriptor) as unknown[]).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = tryObserveByObservable(scope, descriptor, { notify }, true);

            subscriptions.push(subscription);

            notify();
        }

        return subscriptions;
    }
}