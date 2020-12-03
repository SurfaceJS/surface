import NodeType from "../enums/node-type";
import INode    from "../interfaces/node";

export default class LiteralNode implements INode
{
    public readonly type = NodeType.Literal;

    public constructor(public readonly value: string)
    { }

    public toString(): string
    {
        return NodeType[NodeType.Literal];
    }
}