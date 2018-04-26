import { Action, Nullable }  from "@surface/core";
import ExpressionType        from "@surface/expression/expression-type";
import IExpression           from "@surface/expression/interfaces/expression";
import IMemberExpression     from "@surface/expression/interfaces/member-expression";
import Type                  from "@surface/reflection";
import IArrayExpression      from "../../expression/interfaces/array-expression";
import BindParser            from "./bind-parser";
import BindingMode           from "./binding-mode";
import DataBind              from "./data-bind";
import ObserverVisitor       from "./observer-visitor";
import windowWrapper         from "./window-wrapper";

export default class ElementBind
{
    private readonly window: Window;
    private readonly host: HTMLElement;
    private constructor(host: HTMLElement)
    {
        this.host   = host;
        this.window = windowWrapper;
    }

    public static async for(host: HTMLElement, content: Node): Promise<void>
    {
        return new ElementBind(host).traverseElement(content);
    }

    private async bindAttribute(element: Element): Promise<void>
    {
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.value.indexOf("{{") > -1 || attribute.value.indexOf("[[") > -1)
            {
                const context = this.createProxy({ window: this.window, host: this.host, this: element });

                const { bindingMode, expression } = BindParser.scan(context, attribute.value);

                if (attribute.name.startsWith("on-"))
                {
                    let action: Action;
                    if (expression.type == ExpressionType.Member)
                    {
                        action = expression.evaluate() as Action;
                    }
                    else
                    {
                        action = () => expression.evaluate();
                    }

                    element.addEventListener(attribute.name.replace(/^on-/, ""), action);
                    attribute.value = `[binding ${action.name || "expression"}]`;
                }
                else
                {
                    const attributeName = attribute.name.replace(/-([a-z])/g, x => x[1].toUpperCase());

                    let notify = () =>
                    {
                        const value = expression.evaluate();
                        attribute.value = `${value}`;

                        if (attributeName in element)
                        {
                            element[attributeName] = value;
                        }
                    };

                    if (bindingMode == BindingMode.twoWay)
                    {
                        const source = attributeName in element ? element : attribute;

                        const leftProperty = attributeName in element ?
                            Type.from(element).getProperty(attributeName) :
                            Type.from(attribute).getProperty("value");

                        const target = (expression as IMemberExpression).target.evaluate() as Object;
                        const key    = `${(expression as IMemberExpression).key.evaluate()}`;

                        const rightProperty = (target instanceof Function) ?
                            Type.of(target).getStaticProperty(attributeName) :
                            Type.from(target).getProperty(key);

                        if (leftProperty && rightProperty)
                        {
                            notify = () => attribute.value = `${expression.evaluate()}`;

                            DataBind.twoWay(source, leftProperty, target, rightProperty);
                        }
                        else if (rightProperty)
                        {
                            DataBind.oneWay(target, rightProperty, notify);
                        }
                    }
                    else
                    {
                        const visitor = new ObserverVisitor(notify);
                        visitor.visit(expression);
                    }

                    notify();
                }
            }
        }
    }

    private async bindTextNode(element: Element): Promise<void>
    {
        if (element.nodeValue && (element.nodeValue.indexOf("{{") > -1 || element.nodeValue.indexOf("[[") > -1))
        {
            let expression: IExpression;
            const coalesce = <T>(value: Nullable<T>, fallback: T) => value !== null && value !== undefined ? value : fallback;

            const context = this.createProxy({ window: this.window, host: this.host, this: element });

            expression = BindParser.scan(context, element.nodeValue).expression;

            const notify = expression.type == ExpressionType.Array ?
                () => element.nodeValue = `${coalesce((expression as IArrayExpression).evaluate().reduce((previous, current) => `${previous}${current}`), "")}` :
                () => element.nodeValue = `${coalesce(expression.evaluate(), "")}`;

            const visitor = new ObserverVisitor(notify);
            visitor.visit(expression);

            notify();
        }
    }

    private createProxy(context: Object): Object
    {
        const handler: ProxyHandler<Object> =
        {
            get: (target, key) => key in target ? target[key] : this.window[key],
            has: (target, key) => key in target || key in this.window
        };

        return new Proxy(context, handler);
    }

    private async traverseElement(node: Node): Promise<void>
    {
        const promises: Array<Promise<void>> = [];
        for (const element of Array.from(node.childNodes) as Array<Element>)
        {
            if (element.attributes && element.attributes.length > 0)
            {
                promises.push(this.bindAttribute(element));
            }

            if (element.nodeType == Node.TEXT_NODE)
            {
                promises.push(this.bindTextNode(element));
            }

            promises.push(this.traverseElement(element));
        }

        try
        {
            await Promise.all(promises);
        }
        catch (error)
        {
            return Promise.reject(error);
        }
    }
}