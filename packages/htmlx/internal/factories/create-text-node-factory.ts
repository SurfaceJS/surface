import type NodeFactory from "../types/node-factory";

export default function createTextNodeFactory(content: string): NodeFactory
{
    return () =>
    {
        const node = document.createTextNode("");

        node.nodeValue = content;

        return [node, () => ({ dispose: () => void 0 })];
    };
}
