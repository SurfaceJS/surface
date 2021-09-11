import type NodeFactory from "../types/node-fatctory";

export default function textNodeFactory(content: string): NodeFactory
{
    return () =>
    {
        const node = document.createTextNode("");

        node.nodeValue = content;

        return [node, () => ({ dispose: () => void 0 })];
    };
}
