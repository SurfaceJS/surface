import { Action, Action1, Action2, AsyncAction, Indexer, Nullable, } from "@surface/core";
import { assert, typeGuard }                                         from "@surface/core/common/generic";
import { getKeyMember }                                              from "@surface/core/common/object";
import IDisposable                                                   from "@surface/core/interfaces/disposable";
import Evaluate                                                      from "@surface/expression/evaluate";
import IExpression                                                   from "@surface/expression/interfaces/expression";
import IPattern                                                      from "@surface/expression/interfaces/pattern";
import ISubscription                                                 from "@surface/reactive/interfaces/subscription";
import Type                                                          from "@surface/reflection";
import FieldInfo                                                     from "@surface/reflection/field-info";
import
{
    classMap,
    createScope,
    enumerateRange,
    styleMap
}
from "./common";
import DataBind               from "./data-bind";
import directiveRegistry      from "./directive-registry";
import IAttributeDescriptor   from "./interfaces/attribute-descriptor";
import IChoiceDirectiveBranch from "./interfaces/choice-directive-branch";
import IDirective             from "./interfaces/directive";
import IDirectivesDescriptor  from "./interfaces/directives-descriptor";
import IInjectDirective       from "./interfaces/inject-directive";
import IInjectorDirective     from "./interfaces/injector-directive";
import ILoopDirective         from "./interfaces/loop-directive";
import ITemplateDescriptor    from "./interfaces/template-descriptor";
import ITextNodeDescriptor    from "./interfaces/text-node-descriptor";
import TemplateMetadata       from "./metadata/template-metadata";
import ObserverVisitor        from "./observer-visitor";
import ParallelWorker         from "./parallel-worker";
import { Scope }              from "./types";

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

        this.lookup = this.buildLookup(root, descriptor.lookup, 0);
    }

    public static process(scope: Scope, host: Node|Element, node: Node, descriptor: ITemplateDescriptor): IDisposable
    {
        if (TemplateProcessor.postProcessing.has(host))
        {
            TemplateProcessor.postProcessing.get(host)!.forEach(action => action());

            TemplateProcessor.postProcessing.delete(host);
        }

        return new TemplateProcessor(host, node, descriptor).process(scope);
    }

    private buildLookup(node: Node, source: Array<Array<number>>, offset: number): Record<string, Element>
    {
        const lookup: Record<string, Element> = { };

        for (const entry of source)
        {
            if (entry.length > 0)
            {
                lookup[entry.join("-")] = this.findElement(node, entry, offset) as Element;
            }
            else
            {
                lookup[""] = node as Element;
            }
        }

        return lookup;
    }

    private findElement(node: Node, indexes: Array<number>, offset: number): Node
    {
        const [index, ...remaining] = indexes;

        const child = node.childNodes[index + offset];

        if (remaining.length > 0)
        {
            return this.findElement(child, remaining, 0);
        }

        return child;
    }

    private async fireAsync(action: AsyncAction): Promise<void>
    {
        await action();
    }

    private process(scope: Scope): IDisposable
    {
        const subscriptions: Array<ISubscription> = [];
        const disposables:  Array<IDisposable> = [];

        for (const descriptor of this.descriptor.elements)
        {
            const element = this.lookup[descriptor.path];

            const localScope = createScope({ this: element, ...scope });

            subscriptions.push(...this.processAttributes(localScope, element, descriptor.attributes));
            disposables.push(...this.processElementDirectives(localScope, element, descriptor.directives));
            subscriptions.push(...this.processTextNode(localScope, descriptor.textNodes));

            element.dispatchEvent(new Event("bind"));
        }

        disposables.push(this.processTemplateDirectives(createScope(scope), this.descriptor.directives, this.lookup));

        return {
            dispose: () =>
            {
                subscriptions.forEach(x => x.unsubscribe());
                disposables.forEach(x => x.dispose());
            }
        };
    }

    private processAttributes(scope: Scope, element: Element, attributeDescriptors: Array<IAttributeDescriptor>): Array<ISubscription>
    {
        const constructor = window.customElements.get(element.localName);

        const processor = constructor && !(element instanceof constructor) ?
            TemplateProcessor.postProcessing.get(element) ?? TemplateProcessor.postProcessing.set(element, []).get(element)!
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

                        let subscription = ObserverVisitor.observe(scope, descriptor.expression, { notify }, true);

                        notify();

                        subscriptions.push(subscription);
                    }
                    else
                    {
                        const [targetProperty, target] = getKeyMember(scope, descriptor.expression.evaluate({ }) as string);

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

                    let subscription = ObserverVisitor.observe(scope, descriptor.expression, { notify }, true);

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

    private processElementDirectives(scope: Scope, element: Element, directives: Array<IDirective>): Array<IDisposable>
    {
        const disposables: Array<IDisposable> = [];

        for (const directive of directives)
        {
            const handlerConstructor = directiveRegistry.get(directive.name)!;

            disposables.push(new handlerConstructor(scope, element, directive.key, directive.expression));
        }

        return disposables;
    }

    private processConditionalDirective(scope: Scope, templates: Array<HTMLTemplateElement>, branches: Array<IChoiceDirectiveBranch>): IDisposable
    {
        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        const expressions:   Array<[IExpression, HTMLTemplateElement, ITemplateDescriptor]> = [];
        const subscriptions: Array<ISubscription>                                           = [];

        let currentDisposable: IDisposable|null = null;

        const task = () =>
        {
            currentDisposable?.dispose();

            this.removeInRange(start, end);

            for (const [expression, template, descriptor] of expressions)
            {
                if (expression.evaluate(scope))
                {
                    const [content, disposable] = this.processTemplate(scope, this.host, template, descriptor, TemplateMetadata.from(start.parentNode!));

                    currentDisposable = disposable;

                    end.parentNode!.insertBefore(content, end);

                    return;
                }
            }
        };

        const notify = async () => await ParallelWorker.run(task);

        const listener = { notify };

        parent.replaceChild(end, templates[0]);
        parent.insertBefore(start, end);

        for (let index = 0; index < branches.length; index++)
        {
            const branche = branches[index];

            subscriptions.push(ObserverVisitor.observe(scope, branche.expression, listener, true));

            expressions.push([branche.expression, templates[index], branche.descriptor]);

            templates[index].remove();
        }

        this.fireAsync(notify);

        const dispose = () =>
        {
            currentDisposable?.dispose();

            subscriptions.forEach(x => x.unsubscribe());

            this.removeInRange(start, end);

            start.remove();
            end.remove();
        };

        return { dispose };
    }

    private processTemplateDirectives(scope: Scope, directives: IDirectivesDescriptor, lookup: Record<string, Element>): IDisposable
    {
        const disposables: Array<IDisposable> = [];

        for (const directive of directives.inject)
        {
            const template = lookup[directive.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const metadata = TemplateMetadata.hasMetadata(template.parentNode)
                ? TemplateMetadata.from(template.parentNode)
                    : null;

            template.remove();

            if (metadata)
            {
                const key = `${directive.key.evaluate(scope)}`;

                const action = metadata.injectors.get(key);

                if (action)
                {
                    action(scope, this.host, template, directive);
                }
                else
                {
                    template.remove();

                    metadata.injections.set(key, { scope, template, directive });
                }

                disposables.push({ dispose: () => (metadata.injections.delete(key), metadata.defaults.get(key)!()) });
            }
        }

        for (const directive of directives.logical)
        {
            const templates = directive.branches.map(x => lookup[x.path]) as Array<HTMLTemplateElement>;

            disposables.push(this.processConditionalDirective(scope, templates, directive.branches));
        }

        for (const directive of directives.loop)
        {
            const template = lookup[directive.path] as HTMLTemplateElement;

            disposables.push(this.processForDirective(scope, template, directive));
            // disposables.push(new ForDirective(scope, this.host, template, directive));
        }

        for (const directive of directives.injector)
        {
            const template = lookup[directive.path] as HTMLTemplateElement;

            disposables.push(this.processInjectorDirective(scope, template, directive));
        }

        return { dispose: () => disposables.forEach(disposable => disposable.dispose()) };
    }

    private processForDirective(scope: Scope, template: HTMLTemplateElement, directive: ILoopDirective): IDisposable
    {
        assert(template.parentNode);

        const parent = template.parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let cache: Array<[ChildNode, ChildNode, IDisposable]> = [];

        const forInIterator = (elements: Array<unknown>, action: Action1<unknown>) =>
        {
            for (const element in elements)
            {
                action(element);
            }
        };

        const forOfIterator = (elements: Array<unknown>, action: Action1<unknown>) =>
        {
            for (const element of elements)
            {
                action(element);
            }
        };

        const taskFactory = (iterator: Action2<Array<unknown>, Action1<unknown>>) =>
        {
            const tree = document.createDocumentFragment();

            const action = (element: unknown) =>
            {
                const mergedScope = typeGuard<IPattern>(directive.alias, directive.destructured)
                    ? { ...Evaluate.pattern(scope, directive.alias, element), ...scope }
                    : { ...scope, [directive.alias]: element };

                const rowStart = document.createComment("");
                const rowEnd   = document.createComment("");

                tree.appendChild(rowStart);

                const [content, disposable] = this.processTemplate(mergedScope, this.host, template, directive.descriptor, TemplateMetadata.from(start.parentNode!));

                cache.push([rowStart, rowEnd, disposable]);

                tree.appendChild(content);

                tree.appendChild(rowEnd);
            };

            const task = () =>
            {
                const elements = directive.expression.evaluate(scope) as Array<Element>;

                for (const [rowStart, rowEnd, disposable] of cache)
                {
                    disposable.dispose();

                    this.removeInRange(rowStart, rowEnd);

                    rowStart.remove();
                    rowEnd.remove();
                }

                cache = [];

                iterator(elements, action);

                end.parentNode!.insertBefore(tree, end);
            };

            return task;
        };

        const task = taskFactory(directive.operator == "in" ? forInIterator : forOfIterator);

        const notify = async () => await ParallelWorker.run(task);

        const subscription = ObserverVisitor.observe(scope, directive.expression, { notify }, true);

        this.fireAsync(notify);

        const dispose = () =>
        {
            for (const entry of cache)
            {
                const [rowStart, rowEnd, disposable] = entry;

                disposable.dispose();

                this.removeInRange(rowStart, rowEnd);

                rowStart.remove();
                rowEnd.remove();
            }

            (cache as Nullable) = null;

            subscription.unsubscribe();

            this.removeInRange(start, end);

            start.remove();
            end.remove();
        };

        return { dispose };
    }

    private processInjectorDirective(scope: Scope, template: HTMLTemplateElement, directive: IInjectorDirective): IDisposable
    {
        assert(template.parentNode);

        const parent = template.parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        const metadata = TemplateMetadata.from(this.host);

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let handle = 0;

        const key = `${directive.key.evaluate(scope)}`;

        let currentDisposable: IDisposable|null = null;
        let subscription:      ISubscription|null = null;

        const factory = (localScope: Scope, host: Node, template: HTMLTemplateElement, injectDirective?: IInjectDirective) =>
        {
            clearTimeout(handle);

            const task = injectDirective
                ? () =>
                {
                    currentDisposable?.dispose();

                    this.removeInRange(start, end);

                    const { elementScope, scopeAlias } = typeGuard<IPattern>(injectDirective.pattern, injectDirective.destructured)
                        ? { elementScope: Evaluate.pattern(scope, injectDirective.pattern, directive.expression.evaluate(scope)), scopeAlias: "" }
                        : { elementScope: directive.expression.evaluate(scope) as Indexer, scopeAlias: injectDirective.pattern };

                    const mergedScope = injectDirective.destructured
                        ? { ...elementScope, ...localScope }
                        : { [scopeAlias]: elementScope, ...localScope };

                    const [content, disposable] = this.processTemplate(mergedScope, host, template, injectDirective.descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode!.insertBefore(content, end);

                    currentDisposable = disposable;
                }
                : () =>
                {
                    currentDisposable?.dispose();

                    this.removeInRange(start, end);

                    const [content, disposable] = this.processTemplate(scope, host, template, directive.descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode!.insertBefore(content, end);

                    currentDisposable = disposable;
                };

            const notify = async () => await ParallelWorker.run(task);

            subscription = ObserverVisitor.observe(scope, directive.expression, { notify }, true);

            this.fireAsync(notify);
        };

        const defaultFactory = () =>
        {
            currentDisposable?.dispose();
            subscription?.unsubscribe();

            currentDisposable = null;
            subscription      = null;

            handle = setTimeout(() => factory(scope, this.host, template));
        };

        metadata.defaults.set(key, defaultFactory);

        if (this.host.isConnected)
        {
            const injection = metadata.injections.get(key);

            injection
                ? factory(injection.scope, this.host, injection.template, injection.directive)
                : factory(scope, this.host, template);
        }
        else
        {
            metadata.injectors.set(key, factory);

            defaultFactory();
        }

        const dispose = () =>
        {
            currentDisposable?.dispose();

            subscription!.unsubscribe();

            metadata.injectors.delete(key);

            this.removeInRange(start, end);

            start.remove();
            end.remove();
        };

        return { dispose };
    }

    private processTextNode(scope: Scope, descriptors: Array<ITextNodeDescriptor>): Array<ISubscription>
    {
        const subscriptions: Array<ISubscription> = [];

        for (const descriptor of descriptors)
        {
            const node = this.lookup[descriptor.path];

            const notify = () => node.nodeValue = `${(descriptor.expression.evaluate(scope) as Array<unknown>).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = ObserverVisitor.observe(scope, descriptor.expression, { notify }, true);

            subscriptions.push(subscription);

            notify();
        }

        return subscriptions;
    }

    private processTemplate(scope: Indexer, host: Node, template: HTMLTemplateElement, descriptor: ITemplateDescriptor, metadata: TemplateMetadata): [Element, IDisposable]
    {
        const content = template.content.cloneNode(true) as Element;

        content.normalize();

        TemplateMetadata.set(content, metadata);

        const disposable = TemplateProcessor.process(scope, host, content, descriptor);

        return [content, disposable];
    }

    private removeInRange(start: ChildNode, end: ChildNode): void
    {
        for (const element of enumerateRange(start, end))
        {
            element.remove();
        }
    }
}