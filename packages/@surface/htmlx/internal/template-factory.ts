import type { NodeFactory } from "../index.js";
import ReactiveMetadata     from "./reactive-metadata.js";
import type Activator       from "./types/activator";

export default class TemplateFactory
{
    public constructor(private readonly factory: NodeFactory)
    { }

    public create(): { content: Node, activator: Activator }
    {
        const [content, activator] = this.factory();

        return {
            activator: (parent, host, scope, directives) =>
                activator(parent, host, { $metadata: ReactiveMetadata.from(host), ...scope }, directives),
            content,
        };
    }
}