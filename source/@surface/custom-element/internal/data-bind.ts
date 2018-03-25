import { Action, Func } from "@surface/types";
import BindParser       from "./bind-parser";

export default class DataBind
{
    private constructor()
    { }

    public static async for(context: HTMLElement, content: Node): Promise<void>
    {
        return new DataBind().traverseElement(context, content);
    }

    private async bindAttribute(context: object, node: Node): Promise<void>
    {
        const binders: Array<Action> = [];
        const notify = () => binders.forEach(x => x());

        for (const attribute of Array.from(node.attributes))
        {
            if (attribute.value.indexOf("{{") > -1)
            {
                const expression = BindParser.scan({ window: window, host: context, this: node }, attribute.value, notify);

                if (attribute.name.startsWith("on-"))
                {
                    node.addEventListener(attribute.name.replace(/^on-/, ""), () => expression.evaluate());
                    attribute.value = "[binding]";
                }
                else
                {
                    if (attribute.name in node)
                    {
                        binders.push(() => node[attribute.name] = expression.evaluate());
                    }

                    binders.push(() => attribute.value = `${expression.evaluate()}`);
                }
            }
        }

        notify();
    }

    private async bindTextNode(context: object, node: Node): Promise<void>
    {
        const binders: Array<Func<string>> = [];
        const notify = () => node.nodeValue = binders.map(x => x()).join("");

        if (node.nodeValue && node.nodeValue.indexOf("{{") > -1)
        {
            const expression = BindParser.scan({ window: window, host: context, this: node }, node.nodeValue, notify);

            binders.push(() => `${expression.evaluate()}`);
            notify();
        }
    }

    private async traverseElement(context: object, node: Node): Promise<void>
    {
        const promises: Array<Promise<void>> = [];
        for (const currentNode of Array.from(node.childNodes))
        {
            if (currentNode.attributes && currentNode.attributes.length > 0)
            {
                promises.push(this.bindAttribute(context, currentNode));
            }

            if (currentNode.nodeType == Node.TEXT_NODE)
            {
                promises.push(this.bindTextNode(context, currentNode));
            }

            promises.push(this.traverseElement(context, currentNode));
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