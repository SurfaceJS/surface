import NodeType from "../enums/node-type";
import INode    from "../interfaces/node";

export default class AssignmentNode implements INode
{
    public readonly type = NodeType.Assignment;

    public constructor(public readonly left: string, public readonly right: string)
    { }

    public toString(): string
    {
        return NodeType[NodeType.Assignment];
    }
}