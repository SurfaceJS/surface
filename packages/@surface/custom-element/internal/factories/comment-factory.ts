import type NodeFactory from "../types/node-fatctory";

export default function commentFactory(value: string): NodeFactory
{
    return () =>
    {
        const node = document.createComment(value);

        return [node, () => ({ dispose: () => void 0 })];
    };
}
