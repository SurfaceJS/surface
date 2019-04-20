import { Action, Indexer }     from "@surface/core";
import { coalesce, typeGuard } from "@surface/core/common/generic";
import { getKeyMember }        from "@surface/core/common/object";
import { dashedToCamel }       from "@surface/core/common/string";
import Expression              from "@surface/expression";
import ExpressionType          from "@surface/expression/expression-type";
import IArrayExpression        from "@surface/expression/interfaces/array-expression";
import IExpression             from "@surface/expression/interfaces/expression";
import Type                    from "@surface/reflection";
import PropertyInfo            from "@surface/reflection/property-info";
import FieldInfo               from "../../reflection/field-info";
import BindParser              from "./bind-parser";
import DataBind                from "./data-bind";
import ObserverVisitor         from "./observer-visitor";
import { BINDED, CONTEXT }     from "./symbols";
import windowWrapper           from "./window-wrapper";

type Bindable<T> = T & { [BINDED]?: boolean, [CONTEXT]?: Indexer };

export default class TemplateProcessor
{
    private readonly window:  Window;
    private readonly context: Indexer;
    private readonly expressions =
    {
        databind: /\[\[.*\]\]|\{\{.*\}\}/,
        oneWay:   /^\[\[.*\]\]$/,
        path:     /^(?:\{\{|\[\[)\s*((?:\w+\.?)+)\s*(?:\]\]|\}\})$/,
        twoWay:   /^\{\{\s*(\w+\.?)+\s*\}\}$/
    };

    private constructor(context: Indexer)
    {
        this.context = context;
        this.window  = windowWrapper;
    }

    public static process(node: Node, context: Indexer): void
    {
        new TemplateProcessor(context).traverseElement(node);
    }

    public static clear(content: Node)
    {
        for (const element of content.childNodes as unknown as Iterable<Bindable<Element>>)
        {
            if (element[BINDED])
            {
                DataBind.unbind(element);

                element[CONTEXT] = undefined;
                element[BINDED]  = false;

                TemplateProcessor.clear(element);
            }
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
            const context = this.createProxy({ this: element, ...this.context });

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

    private processDirectives(template: HTMLTemplateElement, context: Indexer): void
    {
        if (!template.parentNode)
        {
            throw new Error("Cannor process orphan templates");
        }

        const parent = template.parentNode;

        const directive = template.getAttribute("directive");

        if (directive == "if")
        {
            const start = document.createComment("start-if-directive");
            const end   = document.createComment("end-if-directive");

            const expressions: Array<[IExpression, HTMLTemplateElement]> = [];

            let childs: Array<ChildNode> = [];

            const notify = () =>
            {
                childs.forEach(x => x.remove());

                for (const [expression, template] of expressions)
                {
                    if (expression.evaluate())
                    {
                        const content = template.content.cloneNode(true) as Element;

                        content.normalize();

                        TemplateProcessor.process(content, context);

                        childs = Array.from(content.childNodes);

                        parent.insertBefore(content, end);

                        break;
                    }
                }
            };

            const visitor = new ObserverVisitor({ notify });

            const expression = Expression.from(template.getAttribute("expression")!, context);

            visitor.observe(expression);

            expressions.push([expression, template]);

            let simbling = template.nextElementSibling;

            while (simbling && typeGuard<Element, HTMLTemplateElement>(simbling, x => x.tagName == "TEMPLATE"))
            {
                if (simbling.getAttribute("directive") == "elseif")
                {
                    const expression = Expression.from(simbling.getAttribute("expression")!, context);

                    visitor.observe(expression);

                    expressions.push([expression, simbling]);

                    const next = simbling.nextElementSibling;

                    simbling.remove();

                    simbling = next;
                }
                else if (simbling.getAttribute("directive") == "else")
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
        else if (directive == "foreach")
        {
            const start = document.createComment("start-foreach-directive");
            const end   = document.createComment("end-foreach-directive");

            const expression = Expression.from(template.getAttribute("expression")!, context);

            const scope = template.getAttribute("scope") || "scope";

            let cache: Array<[unknown, Array<ChildNode>]> = [];

            const notify = () =>
            {
                const elements = expression.evaluate() as Array<Element>;

                if (elements.length < cache.length)
                {
                    for (const [, childs] of cache.splice(elements.length))
                    {
                        childs.forEach(x => x.remove());
                    }
                }

                let changedTree = false;

                if (elements.length > 0)
                {
                    for (let i = 0; i < elements.length; i++)
                    {
                        if (i >= cache.length || (i < cache.length && !Object.is(elements[i], cache[i][0])))
                        {
                            const element = elements[i];

                            const content = template.content.cloneNode(true) as Element;

                            content.normalize();

                            TemplateProcessor.process(content, { ...context, [scope]: { item: element }});

                            if (i < cache.length)
                            {
                                for (const child of cache[i][1])
                                {
                                    child.remove();
                                }

                                cache[i] = [element, Array.from(content.childNodes)];

                                changedTree = true;
                            }
                            else
                            {
                                cache.push([element, Array.from(content.childNodes)]);
                            }

                            parent.insertBefore(content, end);
                        }
                        else if (changedTree)
                        {
                            for (const child of cache[i][1])
                            {
                                parent.insertBefore(child, end);
                            }
                        }
                    }
                }
            };

            new ObserverVisitor({ notify }).observe(expression);

            parent.replaceChild(end, template);
            parent.insertBefore(start, end);

            notify();
        }
        else if (template.assignedSlot && typeGuard<HTMLSlotElement, HTMLSlotElement & { scope?: Indexer }>(template.assignedSlot, x => "scope" in x) && template.getAttribute("scope"))
        {
            const content = template.content.cloneNode(true) as DocumentFragment;

            content.normalize();

            const scope = template.getAttribute("scope") || "scope";

            const childs = Array.from(content.children);

            for (const element of childs)
            {
                element.slot = name || "";
            }

            parent.appendChild(content);

            TemplateProcessor.process(parent, { ...this.context, [scope]: template.assignedSlot.scope });
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
                element[BINDED]  = true;
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