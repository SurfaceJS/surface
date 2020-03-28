import { Action, Action1, Action2, Indexer, Nullable } from "@surface/core";
import { assert, typeGuard }                                from "@surface/core/common/generic";
import { getKeyMember }                                     from "@surface/core/common/object";
import Evaluate                                             from "@surface/expression/evaluate";
import IExpression                                          from "@surface/expression/interfaces/expression";
import IPattern                                             from "@surface/expression/interfaces/pattern";
import NodeType                                             from "@surface/expression/node-type";
import ISubscription                                        from "@surface/reactive/interfaces/subscription";
import Type                                                 from "@surface/reflection";
import FieldInfo                                            from "@surface/reflection/field-info";
import
{
    classMap,
    createScope,
    enumerateRange,
    pushSubscription,
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

    public static process(scope: Scope, host: Node|Element, node: Node, descriptor: ITemplateDescriptor): void
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

    private disposeInRange(start: ChildNode, end: ChildNode): void
    {
        // TODO: Review strategy - High priority!!!

        // assert(start.parentNode);

        // const node = start.parentNode;

        // const offset = Array.prototype.indexOf.call(node.childNodes, start);

        for (const element of enumerateRange(start, end))
        {
            const metadata = TemplateMetadata.from(element);

            metadata.onRemoved?.();
            // metadata.dispose?.(node, offset);

            element.remove();
        }
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

    private process(scope: Scope): void
    {
        for (const descriptor of this.descriptor.elements)
        {
            const element = this.lookup[descriptor.path];

            const templateMetadata = TemplateMetadata.from(element);

            this.processAttributes(createScope({ this: element, ...scope }), element, descriptor.attributes);
            this.processTextNode(createScope({ this: element, ...scope }), descriptor.textNodes);

            templateMetadata.dispose = (node, offset) =>
            {
                const lookup = this.buildLookup(node, this.descriptor.lookup, offset);

                DataBind.unbind(element);

                for (const textNodeDescriptor of descriptor.textNodes)
                {
                    const textNode = lookup[textNodeDescriptor.path];

                    DataBind.unbind(textNode);
                }
            };

            templateMetadata.processed = true;

            element.dispatchEvent(new Event("bind"));
        }

        return this.processDirectives(createScope(scope), this.descriptor.directives, this.lookup);
    }

    private processAttributes(scope: Scope, element: Element, attributeDescriptors: Array<IAttributeDescriptor>): void
    {
        const constructor = window.customElements.get(element.localName);

        const processor = constructor && !(element instanceof constructor) ?
            TemplateProcessor.postProcessing.get(element) ?? TemplateProcessor.postProcessing.set(element, []).get(element)!
            : null;

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

                        let subscription = ObserverVisitor.observe(descriptor.expression, scope, { notify }, true);

                        notify();

                        pushSubscription(element, subscription);
                    }
                    else
                    {
                        const [targetProperty, target] = getKeyMember(scope, descriptor.expression.evaluate({ }) as string);

                        const targetMember = Type.from(target).getMember(targetProperty);

                        if (targetMember instanceof FieldInfo && targetMember.readonly)
                        {
                            throw new Error(`Property ${targetProperty} of ${target.constructor.name} is readonly`);
                        }

                        DataBind.twoWay(target, targetProperty, element as Indexer, descriptor.key);
                    }
                }
                else
                {
                    const attribute = element.attributes.getNamedItem(descriptor.name)!;

                    const notify = () => attribute.value = `${(descriptor.expression.evaluate(scope) as Array<unknown>).reduce((previous, current) => `${previous}${current}`)}`;

                    let subscription = ObserverVisitor.observe(descriptor.expression, scope, { notify }, true);

                    pushSubscription(element, subscription);

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
    }

    private async processConditionalDirectives(scope: Scope, templates: Array<HTMLTemplateElement>, branches: Array<IIfStatementBranch>): Promise<void>
    {
        assert(templates[0].parentNode);

        const parent = templates[0].parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        const expressions:   Array<[IExpression, HTMLTemplateElement, ITemplateDescriptor]> = [];
        const subscriptions: Array<ISubscription>                                           = [];

        TemplateMetadata.from(start).onRemoved = () => subscriptions.forEach(x => x.unsubscribe());

        const task = () =>
        {
            if (!end.parentNode)
            {
                subscriptions.forEach(x => x.unsubscribe());

                return;
            }

            this.disposeInRange(start, end);

            for (const [expression, template, descriptor] of expressions)
            {
                if (expression.evaluate(scope))
                {
                    const content = this.processTemplate(scope, this.host, template, descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode.insertBefore(content, end);

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

            subscriptions.push(ObserverVisitor.observe(branche.expression, scope, listener, true));

            expressions.push([branche.expression, templates[index], branche.descriptor]);

            templates[index].remove();
        }

        await notify();
    }

    private processDirectives(scope: Scope, directives: IDirectivesDescriptor, lookup: Record<string, Element>): void
    {
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
            }
        }

        for (const statement of directives.logical)
        {
            const templates = statement.branches.map(x => lookup[x.path]) as Array<HTMLTemplateElement>;

            this.processConditionalDirectives(scope, templates, statement.branches);
        }

        for (const statement of directives.loop)
        {
            const template = lookup[statement.path] as HTMLTemplateElement;

            this.processForDirectives(scope, template, statement);
        }

        for (const statement of directives.injector)
        {
            const template = lookup[statement.path] as HTMLTemplateElement;

            this.processInjectorDirectives(scope, template, statement);
        }
    }

    private async processForDirectives(scope: Scope, template: HTMLTemplateElement, statement: IForStatement): Promise<void>
    {
        assert(template.parentNode);

        const parent = template.parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let cache: Array<[unknown, ChildNode, ChildNode]> = [];

        const forInIterator = (elements: Array<unknown>, action: Action2<unknown, number>) =>
        {
            let index = 0;
            for (const element in elements)
            {
                action(element, index);
                index++;
            }
        };

        const forOfIterator = (elements: Array<unknown>, action: Action2<unknown, number>) =>
        {
            let index = 0;
            for (const element of elements)
            {
                action(element, index);
                index++;
            }
        };

        const notifyFactory = (iterator: Action2<Array<unknown>, Action2<unknown, number>>) =>
        {
            let changedTree = false;
            const tree = document.createDocumentFragment();

            const action = (element: unknown, index: number) =>
            {
                if (index >= cache.length || (index < cache.length && !Object.is(element, cache[index][0])))
                {
                    const mergedScope = typeGuard<IPattern>(statement.alias, statement.destructured)
                        ? { ...Evaluate.pattern(scope, statement.alias, element), ...scope }
                        : { ...scope, [statement.alias]: element };

                    const rowStart = document.createComment("");
                    const rowEnd   = document.createComment("");

                    tree.appendChild(rowStart);

                    const content = this.processTemplate(mergedScope, this.host, template, statement.descriptor, TemplateMetadata.from(start.parentNode!));

                    if (index < cache.length)
                    {
                        const [, $rowStart, $rowEnd] = cache[index];

                        this.disposeInRange($rowStart, $rowEnd);

                        $rowStart.remove();
                        $rowEnd.remove();

                        cache[index] = [element, rowStart, rowEnd];

                        changedTree = true;
                    }
                    else
                    {
                        cache.push([element, rowStart, rowEnd]);
                    }

                    tree.appendChild(content);

                    tree.appendChild(rowEnd);

                    return;
                }
                else if (changedTree)
                {
                    const [, rowStart, rowEnd] = cache[index];

                    let simbling: Nullable<ChildNode> = null;

                    const clone = rowStart.cloneNode();

                    tree.appendChild(clone);

                    while ((simbling = rowStart.nextSibling) && simbling != rowEnd)
                    {
                        tree.appendChild(simbling);
                    }

                    rowStart.remove();

                    tree.replaceChild(rowStart, clone);
                    tree.appendChild(rowEnd);

                    return Promise.resolve();
                }

                return Promise.resolve();
            };

            return () =>
            {
                if (!end.parentNode)
                {
                    subscription.unsubscribe();

                    return;
                }

                const elements = statement.expression.evaluate(scope) as Array<Element>;

                if (elements.length < cache.length)
                {
                    for (const [, rowStart, rowEnd] of cache.splice(elements.length))
                    {
                        this.disposeInRange(rowStart, rowEnd);

                        rowStart.remove();
                        rowEnd.remove();
                    }
                }

                iterator(elements, action);

                end.parentNode.insertBefore(tree, end);
            };
        };

        const task = notifyFactory(statement.operator == "in" ? forInIterator : forOfIterator);

        const notify = async () => await ParallelWorker.run(task);

        const subscription = ObserverVisitor.observe(statement.expression, scope, { notify }, true);

        TemplateMetadata.from(start).onRemoved = () => subscription.unsubscribe();


        await notify();
    }

    private processInjectorDirectives(scope: Scope, template: HTMLTemplateElement, statement: IInjectorStatement): void
    {
        assert(template.parentNode);

        const parent = template.parentNode;

        const start = document.createComment("");
        const end   = document.createComment("");

        const templateMetadata = TemplateMetadata.from(this.host);

        parent.replaceChild(end, template);
        parent.insertBefore(start, end);

        let handle = 0;

        const factory = async (localScope: Scope, host: Node, template: HTMLTemplateElement, injectStatement?: IInjectStatement) =>
        {
            clearTimeout(handle);

            TemplateMetadata.from(start).onRemoved?.();

            if (start.nextSibling != end)
            {
                this.disposeInRange(start, end);
            }

            let subscription: ISubscription;

            const task = injectStatement
                ? () =>
                {
                    if (!end.parentNode)
                    {
                        subscription.unsubscribe();

                        return;
                    }

                    this.disposeInRange(start, end);

                    const { elementScope, scopeAlias } = typeGuard<IPattern>(injectStatement.pattern, injectStatement.destructured)
                        ? { elementScope: Evaluate.pattern(scope, injectStatement.pattern, statement.expression.evaluate(scope)), scopeAlias: "" }
                        : { elementScope: statement.expression.evaluate(scope) as Indexer, scopeAlias: injectStatement.pattern };

                    const mergedScope = injectStatement.destructured
                        ? { ...elementScope, ...localScope }
                        : { [scopeAlias]: elementScope, ...localScope };

                    const content = this.processTemplate(mergedScope, host, template, injectStatement.descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode.insertBefore(content, end);
                }
                : () =>
                {
                    if (!end.parentNode)
                    {
                        subscription.unsubscribe();

                        return;
                    }

                    this.disposeInRange(start, end);

                    const content = this.processTemplate(scope, host, template, statement.descriptor, TemplateMetadata.from(start.parentNode!));

                    end.parentNode.insertBefore(content, end);
                };

            const notify = async () => await ParallelWorker.run(task);

            subscription = ObserverVisitor.observe(statement.expression, scope, { notify }, true);

            TemplateMetadata.from(start).onRemoved = () => subscription.unsubscribe();


            await notify();
        };

        const key = `${statement.key.evaluate(scope)}`;

        if (this.host.isConnected)
        {
            const injection = templateMetadata.injections.get(key);

            if (injection)
            {
                factory(injection.scope, this.host, injection.template, injection.statement);
            }
            else
            {
                factory(scope, this.host, template);
            }
        }
        else
        {
            templateMetadata.injectors.set(key, factory);

            handle = setTimeout(() => factory(scope, this.host, template));
        }
    }

    private processTextNode(scope: Scope, descriptors: Array<ITextNodeDescriptor>): void
    {
        for (const descriptor of descriptors)
        {
            const node = this.lookup[descriptor.path];

            const notify = () => node.nodeValue = `${(descriptor.expression.evaluate(scope) as Array<unknown>).reduce((previous, current) => `${previous}${current}`)}`;

            const subscription = ObserverVisitor.observe(descriptor.expression, scope, { notify }, true);

            pushSubscription(node, subscription);

            notify();
        }
    }

    private processTemplate(scope: Indexer, host: Node, template: HTMLTemplateElement, descriptor: ITemplateDescriptor, metadata: TemplateMetadata): Element
    {
        const content = template.content.cloneNode(true) as Element;

        content.normalize();

        TemplateMetadata.set(content, metadata);

        TemplateProcessor.process(scope, host, content, descriptor);

        return content;
    }
}