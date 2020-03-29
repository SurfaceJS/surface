import { Action, Action1, Action2, AsyncAction, Indexer, Nullable } from "@surface/core";
import { assert, typeGuard }                                        from "@surface/core/common/generic";
import { getKeyMember }                                             from "@surface/core/common/object";
import IDisposable                                                  from "@surface/core/interfaces/disposable";
import Evaluate                                                     from "@surface/expression/evaluate";
import IExpression                                                  from "@surface/expression/interfaces/expression";
import IPattern                                                     from "@surface/expression/interfaces/pattern";
import NodeType                                                     from "@surface/expression/node-type";
import ISubscription                                                from "@surface/reactive/interfaces/subscription";
import Type                                                         from "@surface/reflection";
import FieldInfo                                                    from "@surface/reflection/field-info";
import
{
    classMap,
    createScope,
    enumerateRange,
    styleMap
}
from "./common";
import DataBind              from "./data-bind";
import IAttributeDescriptor  from "./interfaces/attribute-descriptor";
import IDirectivesDescriptor from "./interfaces/directives-descriptor";
import IForStatement         from "./interfaces/for-statement";
import IInjectStatement      from "./interfaces/inject-statement";
import IInjectorStatement    from "./interfaces/injector-statement";
import ITemplateDescriptor   from "./interfaces/template-descriptor";
import ITextNodeDescriptor   from "./interfaces/text-node-descriptor";
import IIfStatementBranch    from "./interfaces/If-branch-statement";
import TemplateMetadata      from "./metadata/template-metadata";
import ObserverVisitor       from "./observer-visitor";
import ParallelWorker        from "./parallel-worker";
import { Scope }             from "./types";

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

        for (const descriptor of this.descriptor.elements)
        {
            const element = this.lookup[descriptor.path];

            subscriptions.push(...this.processAttributes(createScope({ this: element, ...scope }), element, descriptor.attributes));
            subscriptions.push(...this.processTextNode(createScope({ this: element, ...scope }), descriptor.textNodes));

            element.dispatchEvent(new Event("bind"));
        }

        const disposable = this.processDirectives(createScope(scope), this.descriptor.directives, this.lookup);

        return { dispose: () => (subscriptions.forEach(x => x.unsubscribe()), disposable.dispose()) };
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
                if (descriptor.type == "event")
                {
                    const action = descriptor.expression.type == NodeType.ArrowFunctionExpression || descriptor.expression.type == NodeType.Identifier || descriptor.expression.type == NodeType.MemberExpression
                        ? descriptor.expression.evaluate(scope) as Action1<Event>
                        : () => descriptor.expression.evaluate(scope);

                    element.addEventListener(descriptor.name, action);
                }
                else if (descriptor.type == "oneway" || descriptor.type == "twoway")
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

    private processConditionalDirective(scope: Scope, templates: Array<HTMLTemplateElement>, branches: Array<IIfStatementBranch>): IDisposable
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

    private processDirectives(scope: Scope, directives: IDirectivesDescriptor, lookup: Record<string, Element>): IDisposable
    {
        const disposables: Array<IDisposable> = [];

        for (const statement of directives.inject)
        {
            const template = lookup[statement.path] as HTMLTemplateElement;

            assert(template.parentNode);

            const metadata = TemplateMetadata.hasMetadata(template.parentNode)
                ? TemplateMetadata.from(template.parentNode)
                    : null;

            template.remove();

            if (metadata)
            {
                const key = `${statement.key.evaluate(scope)}`;

                const action = metadata.injectors.get(key);

                if (action)
                {
                    action(scope, this.host, template, statement);
                }
                else
                {
                    template.remove();

                    metadata.injections.set(key, { scope, template, statement });
                }

                disposables.push({ dispose: () => (metadata.injections.delete(key), metadata.defaults.get(key)!()) });
            }
        }

        for (const statement of directives.logical)
        {
            const templates = statement.branches.map(x => lookup[x.path]) as Array<HTMLTemplateElement>;

            disposables.push(this.processConditionalDirective(scope, templates, statement.branches));
        }

        for (const statement of directives.loop)
        {
            const template = lookup[statement.path] as HTMLTemplateElement;

            disposables.push(this.processForDirective(scope, template, statement));
        }

        for (const statement of directives.injector)
        {
            const template = lookup[statement.path] as HTMLTemplateElement;

            disposables.push(this.processInjectorDirective(scope, template, statement));
        }

        return { dispose: () => disposables.forEach(disposable => disposable.dispose()) };
    }

    private processForDirective(scope: Scope, template: HTMLTemplateElement, statement: IForStatement): IDisposable
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
                const mergedScope = typeGuard<IPattern>(statement.alias, statement.destructured)
                    ? { ...Evaluate.pattern(scope, statement.alias, element), ...scope }
                    : { ...scope, [statement.alias]: element };

                const rowStart = document.createComment("");
                const rowEnd   = document.createComment("");

                tree.appendChild(rowStart);

                const [content, disposable] = this.processTemplate(mergedScope, this.host, template, statement.descriptor, TemplateMetadata.from(start.parentNode!));

                cache.push([rowStart, rowEnd, disposable]);

                tree.appendChild(content);

                tree.appendChild(rowEnd);
            };

            const task = () =>
            {
                const elements = statement.expression.evaluate(scope) as Array<Element>;

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

        const task = taskFactory(statement.operator == "in" ? forInIterator : forOfIterator);

        const notify = async () => await ParallelWorker.run(task);

        const subscription = ObserverVisitor.observe(scope, statement.expression, { notify }, true);

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

    private processInjectorDirective(scope: Scope, template: HTMLTemplateElement, statement: IInjectorStatement): IDisposable
    {
        assert(template.parentNode);

        const parent = template.parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        const metadata = TemplateMetadata.from(this.host);

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let handle = 0;

        const key = `${statement.key.evaluate(scope)}`;

        let currentDisposable: IDisposable|null = null;
        let subscription:      ISubscription|null = null;

        const factory = (localScope: Scope, host: Node, template: HTMLTemplateElement, injectStatement?: IInjectStatement) =>
        {
            clearTimeout(handle);

            const task = injectStatement
                ? () =>
                {
                    currentDisposable?.dispose();

                    this.removeInRange(start, end);

                    const { elementScope, scopeAlias } = typeGuard<IPattern>(injectStatement.pattern, injectStatement.destructured)
                        ? { elementScope: Evaluate.pattern(scope, injectStatement.pattern, statement.expression.evaluate(scope)), scopeAlias: "" }
                        : { elementScope: statement.expression.evaluate(scope) as Indexer, scopeAlias: injectStatement.pattern };

                    const mergedScope = injectStatement.destructured
                        ? { ...elementScope, ...localScope }
                        : { [scopeAlias]: elementScope, ...localScope };

                    const [content, disposable] = this.processTemplate(mergedScope, host, template, injectStatement.descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode!.insertBefore(content, end);

                    currentDisposable = disposable;
                }
                : () =>
                {
                    currentDisposable?.dispose();

                    this.removeInRange(start, end);

                    const [content, disposable] = this.processTemplate(scope, host, template, statement.descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode!.insertBefore(content, end);

                    currentDisposable = disposable;
                };

            const notify = async () => await ParallelWorker.run(task);

            subscription = ObserverVisitor.observe(scope, statement.expression, { notify }, true);

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
                ? factory(injection.scope, this.host, injection.template, injection.statement)
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