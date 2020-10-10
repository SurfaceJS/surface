import NodeType from "../enums/node-type";
import INode    from "../interfaces/node";

export default class RestNode implements INode
{
    public readonly type = NodeType.Rest;

    public constructor(public readonly name: string)
    { }

    public toString(): string
    {
        return NodeType[NodeType.Rest];
    }
}