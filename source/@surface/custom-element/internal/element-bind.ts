import { Action, Indexer }     from "@surface/core";
import { coalesce, typeGuard } from "@surface/core/common/generic";
import { getKeyMember }        from "@surface/core/common/object";
import { dashedToCamel }       from "@surface/core/common/string";
import ExpressionType          from "@surface/expression/expression-type";
import IExpression             from "@surface/expression/interfaces/expression";
import Type                    from "@surface/reflection";
import PropertyInfo            from "@surface/reflection/property-info";
import IArrayExpression        from "../../expression/interfaces/array-expression";
import FieldInfo               from "../../reflection/field-info";
import BindParser              from "./bind-parser";
import DataBind                from "./data-bind";
import ObserverVisitor         from "./observer-visitor";
import { BINDED, CONTEXT }     from "./symbols";
import windowWrapper           from "./window-wrapper";

type Bindable<T> = T & { [BINDED]?: boolean, [CONTEXT]?: Indexer };

export default class ElementBind
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

    public static for(context: Indexer, content: Node): void
    {
        new ElementBind(context).traverseElement(content);
    }

    public static unbind(content: Node)
    {
        for (const element of content.childNodes as unknown as Iterable<Bindable<Element>>)
        {
            if (element[BINDED])
            {
                DataBind.unbind(element);

                element[CONTEXT] = undefined;
                element[BINDED]  = false;

                ElementBind.unbind(element);
            }
        }
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private bindAttribute(element: Element): void
    {
        //const notifications: Array<Action> = [];
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
                    const isOneWay         = this.expressions.oneWay.test(attribute.value);
                    const isTwoWay         = this.expressions.twoWay.test(attribute.value);
                    const isPathExpression = this.expressions.path.test(attribute.value);
                    const interpolation    = !(isOneWay || isTwoWay);
                    const attributeName    = dashedToCamel(attribute.name);
                    const elementMember    = Type.from(element).getMember(attributeName);
                    const canWrite         = elementMember && !(elementMember instanceof PropertyInfo && elementMember.readonly) && !["class", "style"].includes(attributeName);

                    if (isPathExpression)
                    {
                        const match = this.expressions.path.exec(attribute.value);

                        const target = context;
                        const path   = match![1];

                        const [key, member] = getKeyMember(target, path);

                        const targetMember = Type.from(member).getMember(key);

                        const notification = (value: unknown) =>
                        {
                            if (canWrite)
                            {
                                (element as Indexer)[attributeName] = value;
                            }

                            attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${coalesce(value, "")}`;
                        };

                        DataBind.oneWay(target, path, { notify: notification });

                        if (isTwoWay && elementMember instanceof FieldInfo && targetMember instanceof FieldInfo && !(elementMember instanceof PropertyInfo && elementMember.readonly || targetMember instanceof PropertyInfo && targetMember.readonly))
                        {
                            DataBind.twoWay(target, path, element, attributeName);
                        }
                    }
                    else
                    {
                        const expression = BindParser.scan(context, attribute.value);

                        const notification = () =>
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

                        const visitor = new ObserverVisitor(notification);
                        visitor.visit(expression);
                    }
                }
            }
        }

        //notifications.forEach(notification => notification());
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

                const visitor = new ObserverVisitor(notify);
                visitor.visit(expression);

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

    private traverseElement(node: Node): void
    {
        for (const element of (node.childNodes as unknown as Iterable<Bindable<Element>>))
        {
            if (!element[BINDED] && element.tagName != "TEMPLATE")
            {
                element[BINDED]  = true;
                element[CONTEXT] = this.context;

                if (element.attributes && element.attributes.length > 0)
                {
                    this.bindAttribute(element);
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