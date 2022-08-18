import NodeType   from "../enums/node-type.js";
import type INode from "../interfaces/node.js";

export default class PlaceholderNode implements INode
{
    public readonly type = NodeType.Wildcard;

    public toString(): string
    {
        return NodeType[NodeType.Wildcard]!;
    }
}
