import { Action, ObjectLiteral } from "@surface/core";
import { coalesce, typeGuard }   from "@surface/core/common/generic";
import { dashedToCamel }         from "@surface/core/common/string";
import ExpressionType            from "@surface/expression/expression-type";
import IExpression               from "@surface/expression/interfaces/expression";
import IMemberExpression         from "@surface/expression/interfaces/member-expression";
import Type                      from "@surface/reflection";
import IArrayExpression          from "../../expression/interfaces/array-expression";
import BindParser                from "./bind-parser";
import DataBind                  from "./data-bind";
import ObserverVisitor           from "./observer-visitor";
import { BINDED, CONTEXT }       from "./symbols";
import windowWrapper             from "./window-wrapper";

export default class ElementBind
{
    private readonly window:  Window;
    private readonly context: object;

    private constructor(context: object)
    {
        this.context = context;
        this.window  = windowWrapper;
    }

    public static for(context: object, content: Node): void
    {
        new ElementBind(context).traverseElement(content);
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private bindAttribute(element: Element): void
    {
        const notifications: Array<Action> = [];
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.value.includes("{{") && attribute.value.includes("}}") || attribute.value.includes("[[") && attribute.value.includes("]]"))
            {
                const isOneWay = (attribute.value.startsWith("[[") && attribute.value.endsWith("]]"));
                const isTwoWay = (attribute.value.startsWith("{{") && attribute.value.endsWith("}}"));

                const interpolation = !(isOneWay || isTwoWay);

                const context = this.createProxy({ this: element, ...this.context });

                const expression = BindParser.scan(context, attribute.value);

                if (attribute.name.startsWith("on-"))
                {
                    const action = expression.type == ExpressionType.Member ?
                        expression.evaluate() as Action
                        : () => expression.evaluate();

                    element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                    attribute.value = `[binding ${action.name || "expression"}]`;
                }
                else
                {
                    const attributeName = dashedToCamel(attribute.name);

                    let notification = () =>
                    {
                        const value = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == ExpressionType.Array) && interpolation ?
                            expression.evaluate().reduce((previous, current) => `${previous}${current}`) :
                            expression.evaluate();

                        if (attributeName in element)
                        {
                            (element as ObjectLiteral)[attributeName] = value;
                        }

                        attribute.value = Array.isArray(value) ? "[binding Iterable]" : `${coalesce(value, "")}`;
                    };

                    if (isTwoWay && typeGuard<IExpression, IMemberExpression>(expression, x => x.type == ExpressionType.Member))
                    {
                        const { leftHand, leftHandKey } = attributeName in element ?
                            { leftHand: element, leftHandKey: attributeName }
                            : { leftHand: attribute, leftHandKey: "value" };

                        const leftProperty = Type.from(leftHand).getProperty(leftHandKey);

                        const rightHand    = expression.target.evaluate() as object;
                        const rightHandKey = `${expression.key.evaluate()}`;

                        const rightProperty = (rightHand instanceof Function) ?
                            Type.of(rightHand).getStaticProperty(rightHandKey) :
                            Type.from(rightHand).getProperty(rightHandKey);

                        if (leftProperty && !leftProperty.readonly && rightProperty && !rightProperty.readonly)
                        {
                            notification = () => attribute.value = `${coalesce(expression.evaluate(), "")}`;

                            leftProperty.setter!.call(leftHand, expression.evaluate());
                            DataBind.twoWay(leftHand, leftProperty, rightHand, rightProperty);
                        }
                        else if (rightProperty)
                        {
                            DataBind.oneWay(rightHand, rightProperty, notification);
                        }
                    }
                    else
                    {
                        const visitor = new ObserverVisitor(notification);
                        visitor.visit(expression);
                    }

                    notifications.push(notification);
                }
            }
        }

        notifications.forEach(notification => notification());
    }

    private bindTextNode(element: Element): void
    {
        if (element.nodeValue && (element.nodeValue.indexOf("{{") > -1 || element.nodeValue.indexOf("[[") > -1))
        {
            const context = this.createProxy({ this: element, ...this.context });

            const expression = BindParser.scan(context, element.nodeValue);

            const notify = typeGuard<IExpression, IArrayExpression>(expression, x => x.type == ExpressionType.Array) ?
                () => element.nodeValue = `${coalesce(expression.evaluate().reduce((previous, current) => `${previous}${current}`), "")}` :
                () => element.nodeValue = `${coalesce(expression.evaluate(), "")}`;

            const visitor = new ObserverVisitor(notify);
            visitor.visit(expression);

            notify();
        }
    }

    private createProxy(context: object): object
    {
        const handler: ProxyHandler<ObjectLiteral> =
        {
            get: (target, key) => key in target ? target[key as string] : (this.window as ObjectLiteral)[key as string],
            has: (target, key) => key in target || key in this.window
        };

        return new Proxy(context, handler);
    }

    private traverseElement(node: Node): void
    {
        for (const element of Array.from(node.childNodes) as Array<Element & { [BINDED]?: boolean, [CONTEXT]?: object }>)
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
}