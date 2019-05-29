import { Action, Action1, Action2, Indexer, Nullable }         from "@surface/core";
import { contains }                                            from "@surface/core/common/array";
import { coalesce, typeGuard }                                 from "@surface/core/common/generic";
import { destruct, getKeyMember }                              from "@surface/core/common/object";
import { dashedToCamel }                                       from "@surface/core/common/string";
import Expression                                              from "@surface/expression";
import ExpressionType                                          from "@surface/expression/expression-type";
import IArrayExpression                                        from "@surface/expression/interfaces/array-expression";
import IExpression                                             from "@surface/expression/interfaces/expression";
import Type                                                    from "@surface/reflection";
import PropertyInfo                                            from "@surface/reflection/property-info";
import ISubscription                                           from "../../reactive/interfaces/subscription";
import FieldInfo                                               from "../../reflection/field-info";
import BindParser                                              from "./bind-parser";
import DataBind                                                from "./data-bind";
import ObserverVisitor                                         from "./observer-visitor";
import { BINDED, CONTEXT, ON_AFTER_BINDED, SLOTTED_TEMPLATES } from "./symbols";
import windowWrapper                                           from "./window-wrapper";

type Bindable<T> = T &
{
    [BINDED]?:            boolean,
    [CONTEXT]?:           Indexer,
    [SLOTTED_TEMPLATES]?: Map<string, Nullable<HTMLTemplateElement>>
    [ON_AFTER_BINDED]?:   Action1<Indexer>;
};

export default class TemplateProcessor
{
    private readonly context: Indexer;
    private readonly expressions =
    {
        databind: /\[\[.*\]\]|\{\{.*\}\}/,
        oneWay:   /^\[\[.*\]\]$/,
        path:     /^(?:\{\{|\[\[)\s*((?:\w+\.?)+)\s*(?:\]\]|\}\})$/,
        twoWay:   /^\{\{\s*(\w+\.?)+\s*\}\}$/
    };
    private readonly host:   Node|Element;
    private readonly window: Window;

    private constructor(host: Node|Element, context: Indexer)
    {
        this.host    = host;
        this.context = { host, ...context };
        this.window  = windowWrapper;
    }

    public static process(host: Node|Element, node: Node, context: Indexer): void
    {
        const processor = new TemplateProcessor(host, context);

        processor.traverseElement(node);
    }

    public static clear(node: Bindable<Node>)
    {
        if (node[BINDED])
        {
            DataBind.unbind(node);

            node[CONTEXT] = undefined;
            node[BINDED]  = false;
        }

        for (const element of node.childNodes as unknown as Iterable<Bindable<Element>>)
        {
            TemplateProcessor.clear(element);
        }
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private bindAttributes(element: Element): void
    {
        const notifications: Array<Action> = [];

        for (const attribute of this.wrapAttribute(element))
        {
            if (this.expressions.databind.test(attribute.value))
            {
                const context = this.createProxy({ this: element, ...this.context });

                if (attribute.name.startsWith("on-"))
                {
                    const expression = BindParser.scan(context, attribute.value);

                    const action = expression.type == ExpressionType.Identifier || expression.type ==  ExpressionType.Member ?
                        expression.evaluate() as Action
                        : () => expression.evaluate();

                    element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                    attribute.value = `[binding ${action.name || "expression"}]`;
                }
                else
                {
                    if (element.tagName == "SLOT" && attribute.name == "scope" && !("scope" in element))
                    {
                        Object.defineProperty(element, "scope", { configurable: true, value: null, writable: true });
                    }
                    else if (attribute.name == "scope")
                    {
                        context[attribute.value] = (element.assignedSlot! as Indexer).scope;
                    }

                    const isOneWay         = this.expressions.oneWay.test(attribute.value);
                    const isTwoWay         = this.expressions.twoWay.test(attribute.value);
                    const isPathExpression = this.expressions.path.test(attribute.value);
                    const interpolation    = !(isOneWay || isTwoWay);
                    const attributeName    = dashedToCamel(attribute.name);
                    const elementMember    = Type.from(element).getMember(attributeName);
                    const canWrite         = !!(elementMember && !(elementMember instanceof PropertyInfo && elementMember.readonly || elementMember instanceof FieldInfo && elementMember.readonly) && !["class", "style"].includes(attributeName));

                    if (isPathExpression)
                    {
                        const match = this.expressions.path.exec(attribute.value);

                        const target = context;
                        const path   = match![1];

                        const [key, member] = getKeyMember(target, path);

                        const targetMember = Type.from(member).getMember(key);

                        const notify = (value: unknown) =>
                        {
                            if (canWrite)
                            {
                                (element as Indexer)[attributeName] = value;
                            }

                            attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${coalesce(value, "")}`;
                        };

                        DataBind.oneWay(target, path, { notify });

                        if (isTwoWay && elementMember instanceof FieldInfo && targetMember instanceof FieldInfo && !(elementMember instanceof PropertyInfo && elementMember.readonly || targetMember instanceof PropertyInfo && targetMember.readonly))
                        {
                            DataBind.twoWay(target, path, element, attributeName);
                        }
                    }
                    else
                    {
                        const expression = BindParser.scan(context, attribute.value);

                        const notify = () =>
                        {
                            const value = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == ExpressionType.Array) && interpolation ?
                                expression.evaluate().reduce((previous, current) => `${previous}${current}`) :
                                expression.evaluate();

                            if (canWrite)
                            {
                                (element as Indexer)[attributeName] = value;
                            }

                            attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${coalesce(value, "")}`;
                        };

                        const visitor = new ObserverVisitor({ notify });
                        visitor.observe(expression);

                        notifications.push(notify);
                    }
                }
            }
        }

        notifications.forEach(notification => notification());
    }

    private bindTextNode(element: Element): void
    {
        if (element.nodeValue && this.expressions.databind.test(element.nodeValue))
        {
            const context = this.createProxy({ this: element.parentElement, ...this.context });

            const match = this.expressions.path.exec(element.nodeValue);

            if (match)
            {
                DataBind.oneWay(context, match[1], { notify: value => element.nodeValue = `${coalesce(value, "")}` });
            }
            else
            {
                const expression = BindParser.scan(context, element.nodeValue);

                const notify = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == ExpressionType.Array) ?
                    () => element.nodeValue = `${expression.evaluate().reduce((previous, current) => `${previous}${current}`)}` :
                    () => element.nodeValue = `${coalesce(expression.evaluate(), "")}`;

                const visitor = new ObserverVisitor({ notify });
                visitor.observe(expression);

                notify();
            }
        }
    }

    private createProxy(context: Indexer): Indexer
    {
        const handler: ProxyHandler<Indexer> =
        {
            get: (target, key) => key in target ? target[key as string] : (this.window as Indexer)[key as string],
            has: (target, key) => key in target || key in this.window
        };

        return new Proxy(context, handler);
    }

    private decomposeDirectives(template: HTMLTemplateElement): void
    {
        const attributes = template.getAttributeNames();

        /*if (contains(attributes, "#scope") && contains(attributes, "#if", "#else-if", "#else", "#for"))
        {
            const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

            template.removeAttribute("#if");
            template.removeAttribute("#else-if");
            template.removeAttribute("#else");
            template.removeAttribute("#for");

            innerTemplate.removeAttribute("#scope");

            Array.from(template.content.childNodes).forEach(x => x.remove());

            this.decomposeDirectives(innerTemplate);

            template.content.appendChild(innerTemplate);
        }
        else*/
        if (contains(attributes, "#if", "#else-if", "#else") && contains(attributes, "#for", "#content", "#scope"))
        {
            const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

            template.removeAttribute("#for");
            template.removeAttribute("#content");
            template.removeAttribute("#scope");

            innerTemplate.removeAttribute("#if");
            innerTemplate.removeAttribute("#else-if");
            innerTemplate.removeAttribute("#else");

            Array.from(template.content.childNodes).forEach(x => x.remove());

            this.decomposeDirectives(innerTemplate);

            template.content.appendChild(innerTemplate);
        }
        else if (attributes.includes("#for") && contains(attributes, "#content", "#scope"))
        {
            const innerTemplate = template.cloneNode(true) as HTMLTemplateElement;

            template.removeAttribute("#content");
            template.removeAttribute("#scope");

            innerTemplate.removeAttribute("#for");

            Array.from(template.content.childNodes).forEach(x => x.remove());

            this.decomposeDirectives(innerTemplate);

            template.content.appendChild(innerTemplate);
        }
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private processDirectives(template: HTMLTemplateElement, context: Indexer): void
    {
        if (!template.parentNode)
        {
            throw new Error("Cannor process orphan templates");
        }

        this.decomposeDirectives(template);

        const parent = template.parentNode;

        const host = this.host as Bindable<Node|Element>;

        if (template.hasAttribute("#content") && "querySelector" in host)
        {
            const reference = document.createComment("directive-content");

            const rawScope = template.getAttribute("#scope");

            const contentScope: Indexer = rawScope ? Expression.from(rawScope, this.createProxy(context)).evaluate() as Indexer : { };

            const slotName = template.getAttribute("#content") || "";

            const slottedTemplates = host[SLOTTED_TEMPLATES] = host[SLOTTED_TEMPLATES] || new Map<string, Nullable<HTMLTemplateElement>>();

            if (!slottedTemplates.has(slotName))
            {
                const outterTemplate = host.querySelector<HTMLTemplateElement>(`template[content=${slotName}]`);
                slottedTemplates.set(slotName, outterTemplate);

                if (outterTemplate)
                {
                    outterTemplate.remove();
                }
            }

            const outterTemplate = slottedTemplates.get(slotName) || template;

            const scopeSpression = outterTemplate.getAttribute("scope") || "scope";

            const destructuredScope = scopeSpression.startsWith("{");

            const { scope, scopeAlias } = destructuredScope ?
                { scope: destruct(scopeSpression, contentScope), scopeAlias: "" } :
                { scope: contentScope, scopeAlias: scopeSpression };

            const content = document.importNode(outterTemplate.content, true);

            content.normalize();

            parent.replaceChild(reference, template);

            const apply = (outterContext: Indexer) =>
            {
                const merged = destructuredScope ?
                    { ...scope, ...outterContext }
                    : { [scopeAlias]: scope, ...outterContext };

                TemplateProcessor.process(this.host, content, merged);

                reference.parentNode!.insertBefore(content, reference);
                reference.remove();
            };

            if (!host[BINDED])
            {
                const onAfterBinded = host[ON_AFTER_BINDED];

                host[ON_AFTER_BINDED] = function(outterContext: Indexer)
                {
                    if (onAfterBinded)
                    {
                        onAfterBinded.call(this, outterContext);
                    }

                    apply(outterContext);

                    host[ON_AFTER_BINDED] = onAfterBinded;
                };
            }
            else
            {
                apply(host[CONTEXT] as Indexer);
            }
        }
        else if (template.hasAttribute("#if"))
        {
            const start = document.createComment("start-if-directive");
            const end   = document.createComment("end-if-directive");

            const expressions:   Array<[IExpression, HTMLTemplateElement]> = [];
            const subscriptions: Array<ISubscription>                      = [];

            const notify = () =>
            {
                if (!end.parentNode)
                {
                    subscriptions.forEach(x => x.unsubscribe());

                    return;
                }

                let simbling: Nullable<ChildNode> = null;

                while ((simbling = start.nextSibling) && simbling != end)
                {
                    simbling.remove();
                    TemplateProcessor.clear(simbling);
                }

                for (const [expression, template] of expressions)
                {
                    if (expression.evaluate())
                    {
                        const content = template.content.cloneNode(true) as Element;

                        content.normalize();

                        TemplateProcessor.process(this.host, content, context);

                        end.parentNode.insertBefore(content, end);

                        break;
                    }
                }
            };

            const visitor = new ObserverVisitor({ notify });

            const expression = Expression.from(template.getAttribute("#if")!, context);

            subscriptions.push(visitor.observe(expression));

            expressions.push([expression, template]);

            let simbling = template.nextElementSibling;

            while (simbling && typeGuard<Element, HTMLTemplateElement>(simbling, x => x.tagName == "TEMPLATE"))
            {
                if (simbling.hasAttribute("#else-if"))
                {
                    const expression = Expression.from(simbling.getAttribute("#else-if")!, this.createProxy(context));

                    subscriptions.push(visitor.observe(expression));

                    expressions.push([expression, simbling]);

                    const next = simbling.nextElementSibling;

                    simbling.remove();

                    simbling = next;
                }
                else if (simbling.hasAttribute("#else"))
                {
                    simbling.remove();

                    expressions.push([Expression.constant(true), simbling]);

                    break;
                }
                else
                {
                    break;
                }
            }

            parent.replaceChild(end, template);
            parent.insertBefore(start, end);

            notify();
        }
        else if (template.hasAttribute("#for"))
        {
            const start = document.createComment("start-for-directive");
            const end   = document.createComment("end-for-directive");

            const forExpression = /(.*)(in|of)(.*)/;
            const rawExpression = template.getAttribute("#for")!;

            if (!forExpression.test(rawExpression))
            {
                throw new Error("Invalid expression");
            }

            const [, aliasExpression, operator, iterableExpression] = forExpression.exec(rawExpression)!.map(x => x.trim());

            const destructured = aliasExpression.startsWith("[");

            const expression = Expression.from(iterableExpression, this.createProxy(context));

            let cache: Array<[unknown, Array<ChildNode>]> = [];

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
                        const content = template.content.cloneNode(true) as Element;

                        content.normalize();

                        const mergedContext = destructured ?
                            { ...destruct(aliasExpression, element as Array<unknown>), ...context }
                            : { ...context, [aliasExpression]: element };

                        TemplateProcessor.process(this.host, content, mergedContext);

                        if (index < cache.length)
                        {
                            for (const child of cache[index][1])
                            {
                                child.remove();
                                TemplateProcessor.clear(child);
                            }

                            cache[index] = [element, Array.from(content.childNodes)];

                            changedTree = true;
                        }
                        else
                        {
                            cache.push([element, Array.from(content.childNodes)]);
                        }

                        tree.appendChild(content);
                    }
                    else if (changedTree)
                    {
                        for (const child of cache[index][1])
                        {
                            tree.appendChild(child);
                        }
                    }
                };

                return () =>
                {
                    if (!end.parentNode)
                    {
                        subscription.unsubscribe();

                        return;
                    }

                    const elements = expression.evaluate() as Array<Element>;

                    if (elements.length < cache.length)
                    {
                        for (const [, childs] of cache.splice(elements.length))
                        {
                            for (const child of childs)
                            {
                                child.remove();
                                TemplateProcessor.clear(child);
                            }
                        }
                    }

                    if (elements.length > 0)
                    {
                        iterator(elements, action);
                    }

                    end.parentNode.insertBefore(tree, end);
                };
            };

            const notify = notifyFactory(operator == "in" ? forInIterator : forOfIterator);

            const subscription = new ObserverVisitor({ notify }).observe(expression);

            parent.replaceChild(end, template);
            parent.insertBefore(start, end);

            notify();
        }
    }

    private traverseElement(node: Node): void
    {
        for (const element of (node.childNodes as unknown as Iterable<Bindable<Element>>))
        {
            if (typeGuard<Element, HTMLTemplateElement>(element, x => x.tagName == "TEMPLATE"))
            {
                this.processDirectives(element, this.context);
            }
            else if (!element[BINDED])
            {
                element[CONTEXT] = this.context;

                if (element.attributes && element.attributes.length > 0)
                {
                    this.bindAttributes(element);
                }

                if (element.nodeType == Node.TEXT_NODE)
                {
                    this.bindTextNode(element);
                }

                this.traverseElement(element);

                if (element[ON_AFTER_BINDED])
                {
                    element[ON_AFTER_BINDED]!(this.context);
                }

                element[BINDED] = true;
            }
        }
    }

    private *wrapAttribute(element: Element): IterableIterator<Attr>
    {
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.name.startsWith("*"))
            {
                const wrapper = document.createAttribute(attribute.name.replace(/^\*/, ""));

                wrapper.value = attribute.value;
                element.removeAttributeNode(attribute);
                element.setAttributeNode(wrapper);

                yield wrapper;
            }
            else
            {
                yield attribute;
            }
        }
    }
}