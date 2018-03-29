import { Action, Func, Nullable } from "@surface/types";
import BindParser       from "./bind-parser";

export default class DataBind
{
    private readonly host: HTMLElement;
    private constructor(host: HTMLElement)
    {
        this.host = host;
    }

    public static async for(host: HTMLElement, content: Node): Promise<void>
    {
        return new DataBind(host).traverseElement(content);
    }

    private async bindAttribute(element: Element): Promise<void>
    {
        const binders: Array<Action> = [];
        const notify = () => binders.forEach(x => x());

        for (const attribute of Array.from(element.attributes))
        {
            if (attribute.value.indexOf("{{") > -1)
            {
                const expression = BindParser.scan({ window: window, host: this.host, this: element }, attribute.value, notify);

                if (attribute.name.startsWith("on-"))
                {
                    element.addEventListener(attribute.name.replace(/^on-/, ""), () => expression.evaluate());
                    attribute.value = "[binding]";
                }
                else
                {
                    const property = attribute.name.replace(/-([a-z])/g, x => x[1].toUpperCase());

                    if (property in element)
                    {
                        binders.push(() => element[property] = expression.evaluate());
                    }

                    binders.push(() => attribute.value = `${expression.evaluate()}`);
                }
            }
        }

        notify();
    }

    private async bindTextNode(element: Element): Promise<void>
    {
        const binders: Array<Func<string>> = [];
        const notify = () => element.nodeValue = binders.map(x => x()).join("");

        if (element.nodeValue && element.nodeValue.indexOf("{{") > -1)
        {
            const expression = BindParser.scan({ window: window, host: this.host, this: element }, element.nodeValue, notify);

            const coalesce = <T>(value: Nullable<T>, fallback: T) => value !== null && value !== undefined ? value : fallback;

            binders.push(() => `${coalesce(expression.evaluate(), "")}`);
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