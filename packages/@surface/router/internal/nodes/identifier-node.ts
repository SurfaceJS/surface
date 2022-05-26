import NodeType   from "../enums/node-type.js";
import type INode from "../interfaces/node";

export default class IdentifierNode implements INode
{
    public readonly type = NodeType.Identifier;

    public constructor(public readonly name: string, public readonly optional: boolean = false)
    { }

    public toString(): string
    {
        return NodeType[NodeType.Identifier]!;
    }
}
