import IExpression  from "@surface/expression/interfaces/expression";
import { Nullable } from "@surface/types";
import BindParser   from "./bind-parser";

export default class DataBind
{
    private readonly window: Window;
    private readonly host: HTMLElement;
    private constructor(host: HTMLElement)
    {
        this.host = host;

        const wrapper = { "Window": function () { return; } }["Window"];
        wrapper.prototype = window;
        wrapper.prototype.constructor = wrapper;
        this.window = wrapper.prototype;
    }

    public static async for(host: HTMLElement, content: Node): Promise<void>
    {
        return new DataBind(host).traverseElement(content);
    }

    private async bindAttribute(element: Element): Promise<void>
    {
        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.value.indexOf("{{") > -1)
            {
                const context = { window: this.window, host: this.host, this: element };
                if (attribute.name.startsWith("on-"))
                {
                    const expression = BindParser.scan(context, attribute.value, element, "");

                    element.addEventListener(attribute.name.replace(/^on-/, ""), () => expression.evaluate());
                    attribute.value = "[binding]";
                }
                else
                {
                    const property = attribute.name.replace(/-([a-z])/g, x => x[1].toUpperCase());

                    let expression: IExpression;

                    const notify = () =>
                    {
                        if (!(property in element))
                        {
                            attribute.value = `${expression.evaluate()}`;
                        }
                    };

                    expression = BindParser.scan(context, attribute.value, element, property, notify);

                    notify();
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

            expression = BindParser.scan({ window: this.window, host: this.host, this: element }, element.nodeValue, element, "", notify);

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