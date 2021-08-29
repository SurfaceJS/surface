import type Factory from "../types/fatctory";

export default function commentFactory(value: string): Factory
{
    return () =>
    {
        const node = document.createComment(value);

        return [node, () => ({ dispose: () => void 0 })];
    };
}
