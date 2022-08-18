import type NodeFactory from "../types/node-factory.js";

export default function createCommentFactory(value: string): NodeFactory
{
    return () =>
    {
        const node = document.createComment(value);

        return [node, () => ({ dispose: () => void 0 })];
    };
}
