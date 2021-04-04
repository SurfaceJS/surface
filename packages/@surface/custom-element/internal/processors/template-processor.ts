import type { Delegate, IDisposable, Indexer }             from "@surface/core";
import { DisposableMetadata, assert, getValue, typeGuard } from "@surface/core";
import type { Subscription }                               from "@surface/reactive";
import { FieldInfo, Type }                                 from "@surface/reflection";
import
{
    buildStackTrace,
    classMap,
    inheritScope,
    styleMap,
    tryEvaluateExpressionByTraceable,
    tryObserveByObservable,
} from "../common.js";
import ChoiceDirectiveHandler                   from "../directives/handlers/choice-directive-handler.js";
import EventDirectiveHandler                    from "../directives/handlers/event-directive-handler.js";
import InjectDirectiveHandler                   from "../directives/handlers/inject-directive-handler.js";
import LoopDirectiveHandler                     from "../directives/handlers/loop-directive-handler.js";
import PlaceholderDirectiveHandler              from "../directives/handlers/placeholder-directive-handler.js";
import TemplateProcessError                     from "../errors/template-process-error.js";
import type IAttributeDirective                 from "../interfaces/attribute-directive";
import type ICustomDirective                    from "../interfaces/custom-directive";
import type IDirectivesDescriptor               from "../interfaces/directives-descriptor";
import type IEventDirective                     from "../interfaces/event-directive";
import type ITextNodeDescriptor                 from "../interfaces/text-node-descriptor";
import DataBind                                 from "../reactivity/data-bind.js";
import { disposeTree }                          from "../singletons.js";
import type { DirectiveHandlerFactory }         from "../types";
import type TemplateDirectiveContext            from "../types/template-directive-context.js";
import type TemplateProcessorContext            from "../types/template-processor-context.js";

export default class TemplateProcessor
{
    private static readonly postProcessing: Map<Node, Delegate[]> = new Map();

    private readonly context: TemplateProcessorContext;
    private readonly lookup:  Record<string, Node>;

    private constructor(context: TemplateProcessorContext)
    {
        this.context = context;

        this.lookup = this.buildLookup(context.root, context.descriptor.lookup);
    }

    public static process(context: TemplateProcessorContext): IDisposable
    {
        if (TemplateProcessor.postProcessing.has(context.host))
        {
            TemplateProcessor.postProcessing.get(context.host)!.forEach(action => action());

            TemplateProcessor.postProcessing.delete(context.host);
        }

        return new TemplateProcessor(context).process();
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

    private process(): IDisposable
    {
        const disposables: IDisposable[] = [];

        for (const descriptor of this.context.descriptor.elements)
        {
            const element = this.lookup[descriptor.path] as HTMLElement & Partial<IDisposable>;

            const $this = element.nodeType == Node.DOCUMENT_FRAGMENT_NODE && this.context.parentNode ? this.context.parentNode : element;

            const localScope = inheritScope({ this: $this, ...this.context.scope });

            disposables.push(this.processAttributes(localScope, element, descriptor.attributes));
            disposables.push(this.processEvents(localScope, element, descriptor.events));
            disposables.push(this.processElementDirectives(localScope, element, descriptor.directives));
            disposables.push(this.processTextNode(localScope, descriptor.textNodes));
            disposables.push(DisposableMetadata.from(localScope));

            element.dispatchEvent(new Event("bind"));
        }

        disposables.push(this.processTemplateDirectives(this.context.descriptor.directives));

        return {
            dispose: () =>
            {
                disposables.splice(0).forEach(x => x.dispose());
                disposeTree(this.context.root);
            },
        };
    }

    private processAttributes(scope: object, element: Element, attributeDescriptors: IAttributeDirective[]): IDisposable
    {
        const constructor = window.customElements.get(element.localName);

        let processor: Delegate[] | undefined;

        if (constructor && !(element instanceof constructor))
        {
            TemplateProcessor.postProcessing.set(element, processor = []);
        }

        const subscriptions: Subscription[] = [];

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

                        throw new TemplateProcessError(message, buildStackTrace(descriptor.stackTrace));
                    }

                    if (descriptor.type == "oneway")
                    {
                        let listener: Delegate;

                        if (descriptor.name == "class" || descriptor.name == "style")
                        {
                            listener = descriptor.name == "class"
                                ? () => element.setAttribute(descriptor.name, classMap(tryEvaluateExpressionByTraceable(scope, descriptor) as Record<string, boolean>))
                                : () => element.setAttribute(descriptor.name, styleMap(tryEvaluateExpressionByTraceable(scope, descriptor) as Record<string, boolean>));
                        }
                        else
                        {
                            listener = () => (element as object as Indexer)[descriptor.key] = tryEvaluateExpressionByTraceable(scope, descriptor);
                        }

                        const subscription = tryObserveByObservable(scope, descriptor, listener, true);

                        listener();

                        subscriptions.push(subscription);
                    }
                    else
                    {
                        const path = descriptor.observables[0];

                        const right    = getValue(scope, ...path.slice(0, path.length - 1)) as object;
                        const rightKey = path[path.length - 1];

                        const rightMember = Type.from(right).getMember(rightKey);

                        if (!rightMember || rightMember instanceof FieldInfo && rightMember.readonly)
                        {
                            const message = rightMember
                                ? `Binding error in ${descriptor.rawExpression}: Property "${rightKey}" of ${right.constructor.name} is readonly`
                                : `Binding error in ${descriptor.rawExpression}: Property "${rightKey}" does not exists on type ${right.constructor.name}`;

                            throw new TemplateProcessError(message, buildStackTrace(descriptor.stackTrace));
                        }

                        subscriptions.push(...DataBind.twoWay(element, [descriptor.key], scope, path));
                    }
                }
                else
                {
                    const listener = (): void => element.setAttribute(descriptor.name, `${(tryEvaluateExpressionByTraceable(scope, descriptor) as unknown[]).reduce((previous, current) => `${previous}${current}`)}`);

                    const subscription = tryObserveByObservable(scope, descriptor, listener, true);

                    subscriptions.push(subscription);

                    listener();
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

        return { dispose: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
    }

    private processElementDirectives(scope: object, element: HTMLElement, directives: ICustomDirective[]): IDisposable
    {
        const disposables: IDisposable[] = [];

        for (const directive of directives)
        {
            const handlerConstructor = this.context.customDirectives.get(directive.name);

            if (!handlerConstructor)
            {
                throw new TemplateProcessError(`Unregistered directive #${directive.name}.`, buildStackTrace(directive.stackTrace));
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

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    }

    private processEvents(localScope: object, element: HTMLElement, events: IEventDirective[]): IDisposable
    {
        const disposables: IDisposable[] = [];

        for (const directive of events)
        {
            disposables.push(new EventDirectiveHandler(localScope, element, directive));
        }

        return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
    }

    private processTemplateDirectives(directives: IDirectivesDescriptor): IDisposable
    {
        const disposables: IDisposable[] = [];

        for (const directive of directives.injections)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const context: TemplateDirectiveContext =
            {
                customDirectives: this.context.customDirectives,
                host:              this.context.host,
                parentNode:        template.parentNode,
                scope:             inheritScope(this.context.scope),
            };

            disposables.push(new InjectDirectiveHandler(template, directive, context));
            disposables.push(DisposableMetadata.from(context.scope));
        }

        for (const directive of directives.logicals)
        {
            const templates = directive.branches.map(x => this.lookup[x.path]) as HTMLTemplateElement[];

            assert(templates[0].parentNode);

            const context: TemplateDirectiveContext =
            {
                customDirectives: this.context.customDirectives,
                host:              this.context.host,
                parentNode:        this.context.parentNode ?? templates[0].parentNode,
                scope:             inheritScope(this.context.scope),
            };

            disposables.push(new ChoiceDirectiveHandler(templates, directive, context));
            disposables.push(DisposableMetadata.from(context.scope));
        }

        for (const directive of directives.loops)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const context: TemplateDirectiveContext =
            {
                customDirectives: this.context.customDirectives,
                host:              this.context.host,
                parentNode:        this.context.parentNode ?? template.parentNode,
                scope:             inheritScope(this.context.scope),
            };

            disposables.push(new LoopDirectiveHandler(template, directive, context));
            disposables.push(DisposableMetadata.from(context.scope));
        }

        for (const directive of directives.placeholders)
        {
            const template = this.lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const context: TemplateDirectiveContext =
            {
                customDirectives: this.context.customDirectives,
                host:              this.context.host,
                parentNode:        this.context.parentNode ?? template.parentNode,
                scope:             inheritScope(this.context.scope),
            };

            disposables.push(new PlaceholderDirectiveHandler(template, directive, context));
            disposables.push(DisposableMetadata.from(context.scope));
        }

        return { dispose: () => disposables.splice(0).forEach(disposable => disposable.dispose()) };
    }

    private processTextNode(scope: object, descriptors: ITextNodeDescriptor[]): IDisposable
    {
        const subscriptions: Subscription[] = [];

        for (const descriptor of descriptors)
        {
            const node = this.lookup[descriptor.path];

            const listener = (): string => node.nodeValue = `${(tryEvaluateExpressionByTraceable(scope, descriptor) as unknown[]).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = tryObserveByObservable(scope, descriptor, listener, true);

            subscriptions.push(subscription);

            listener();
        }

        return { dispose: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
    }
}