import NodeType   from "../enums/node-type.js";
import type INode from "../interfaces/node.js";

export default class SegmentNode implements INode
{
    public readonly type = NodeType.Segment;

    public constructor(public readonly nodes: INode[], public readonly optional: boolean)
    { }

    public toString(): string
    {
        return `[${this.nodes.map(x => x.toString()).join(", ")}]`;
    }
}