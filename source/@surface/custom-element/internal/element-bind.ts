import IExpression           from "@surface/expression/interfaces/expression";
import IMemberExpression     from "@surface/expression/interfaces/member-expression";
import { Nullable }          from "@surface/types";
import BindExpressionVisitor from "./bind-expression-visitor";
import BindParser            from "./bind-parser";
import BindingMode           from "./binding-mode";
import DataBind              from "./data-bind";
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
            if (attribute.value.indexOf("{{") > -1)
            {
                const context = { window: this.window, host: this.host, this: element };
                const { bindingMode, expression } = BindParser.scan(context, attribute.value);

                if (attribute.name.startsWith("on-"))
                {
                    element.addEventListener(attribute.name.replace(/^on-/, ""), () => expression.evaluate());
                    attribute.value = "[binding]";
                }
                else
                {
                    const attributeName = attribute.name.replace(/-([a-z])/g, x => x[1].toUpperCase());

                    if (bindingMode == BindingMode.oneWay)
                    {
                        const notify = () =>
                        {
                            const value = expression.evaluate();
                            attribute.value = `${value}`;

                            if (attributeName in element)
                            {
                                element[attributeName] = value;
                            }
                        };

                        const visitor = new BindExpressionVisitor(notify);
                        visitor.visit(expression);
                    }
                    else if (attributeName in element)
                    {
                        const { target, key } = (expression as IMemberExpression);
                        DataBind.apply(element, attributeName, target.evaluate() as Object, key.evaluate() as string);
                    }
                }
            }
        }
    }

    private async bindTextNode(element: Element): Promise<void>
    {
        if (element.nodeValue && (element.nodeValue.indexOf("{{") > -1 || element.nodeValue.indexOf("[[")))
        {
            let expression: IExpression;
            const coalesce = <T>(value: Nullable<T>, fallback: T) => value !== null && value !== undefined ? value : fallback;
            const notify = () => element.nodeValue = `${coalesce(expression.evaluate(), "")}`;

            expression = BindParser.scan({ window: this.window, host: this.host, this: element }, element.nodeValue).expression;

            notify();
        }
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