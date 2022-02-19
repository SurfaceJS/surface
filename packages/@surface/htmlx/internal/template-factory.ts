import type { NodeFactory } from "../index.js";
import type Activator       from "./types/activator";

export default class TemplateFactory
{
    public constructor(private readonly factory: NodeFactory)
    { }

    public create(): { content: Node, activator: Activator }
    {
        const [content, activator] = this.factory();

        return { activator, content };
    }
}