import NodeType from "../enums/node-type";
import INode    from "../interfaces/node";

export default class PlaceholderNode implements INode
{
    public readonly type = NodeType.Wildcard;

    public toString(): string
    {
        return NodeType[NodeType.Wildcard];
    }
}