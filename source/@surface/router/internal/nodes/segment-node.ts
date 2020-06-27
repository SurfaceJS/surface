import NodeType from "../enums/node-type";
import INode    from "../interfaces/node";

export default class SegmentNode implements INode
{
    public readonly type = NodeType.Segment;

    public constructor(public readonly nodes: Array<INode>, public readonly optional: boolean)
    { }

    public toString(): string
    {
        return `[${this.nodes.map(x => x.toString()).join(", ")}]`;
    }
}