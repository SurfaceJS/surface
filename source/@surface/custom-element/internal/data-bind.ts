import CustomElement from "..";

import Parser from "./parser";

import { Action, Func } from "@surface/types";

export default class DataBind<T extends CustomElement>
{
    public constructor(context: T, content: Node)
    {
        this.traverseElement(context, content);
    }

    public static for<T extends CustomElement>(context: T, content: Node): DataBind<T>
    {
        return new DataBind(context, content);
    }

    private async bindAttribute(context: object, node: Node): Promise<void>
    {
        const binders: Array<Action> = [];
        const notify = async () => await Promise.resolve(binders.forEach(x => x()));

        for (const attribute of node.attributes.asEnumerable())
        {
            if (attribute.value.indexOf("{{") > -1)
            {
                const match = /{{(.+)}}/.exec(attribute.value);

                if (match)
                {
                    console.log(attribute.value);
                    console.time();
                    // tslint:disable-next-line:no-unused-expression
                    const parser = new Parser({ global: window, model: context, self: node },  match[1]);
                    console.timeEnd();

                    console.time();
                    const expression = parser.parse();
                    console.timeEnd();
                    console.log(expression);
                    if (attribute.name.startsWith("on-"))
                    {
                        node.addEventListener(attribute.name.replace(/^on-/, ""), () => expression.execute());
                    }
                    else
                    {
                        if (attribute.name in node)
                        {
                            binders.push(() => node[attribute.name] = expression.execute());
                        }
                    }
                }
                else
                {
                    throw new Error(`Expression bind not supported: ${attribute.value}`);
                }
            }
        }

        notify();

        await Promise.resolve();
    }

    private async bindTextNode(context: object, node: Node): Promise<void>
    {
        const binders: Array<Func<string>> = [];
        const notify = async () => node.nodeValue = await Promise.resolve(binders.map(x => x()).join(""));

        if (node.nodeValue && node.nodeValue.indexOf("{{") > -1)
        {
            console.log(node.nodeValue);
            console.time();
            let groups = node.nodeValue.match(/(.*?)(?:{{ *(?:(\w+|\.)) *}})(.*?)|(.*)/g);
            if (groups && groups.length > 0)
            {
                let matches = groups.map(x => x && /(.*?)(?:{{ *((?:\w|\.)+) *}})(.*?)|(.*)/g.exec(x) || [""]);
                matches.forEach
                (
                    item =>
                    {
                        let [left, rawExpression, right, remaining] = item.slice(1);

                        if (rawExpression)
                        {
                            const parser = new Parser({ global: window, model: context, self: node },  rawExpression);
                            const expression = parser.parse();

                            binders.push(() => `${left || ""}${expression.execute() || ""}${right || ""}${remaining || ""}`);
                        }
                        else
                        {
                            binders.push(() => `${left || ""}${right || ""}${remaining || ""}`);
                        }
                    }
                );
                notify();
            }
            console.timeEnd();
        }

        await Promise.resolve();
    }

    private async traverseElement(context: object, node: Node): Promise<void>
    {
        for (const currentNode of Array.from(node.childNodes))
        {
            if (currentNode.attributes && currentNode.attributes.length > 0)
            {
                this.bindAttribute(context, currentNode);
            }

            if (currentNode.nodeType == Node.TEXT_NODE)
            {
                this.bindTextNode(context, currentNode);
            }

            this.traverseElement(context, currentNode);
        }

        await Promise.resolve();
    }
}