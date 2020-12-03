import NodeType       from "../enums/node-type";
import INode          from "../interfaces/node";
import TypeGuard      from "../type-guard";
import AssignmentNode from "./assignment-node";
import IdentifierNode from "./identifier-node";

export default class TransformerNode implements INode
{
    public readonly type = NodeType.Transformer;
    public readonly optional: boolean;

    public constructor(public readonly name: string, public readonly transformer: IdentifierNode | AssignmentNode)
    {
        this.optional = TypeGuard.isAssignment(transformer) || transformer.optional;
    }

    public toString(): string
    {
        return NodeType[NodeType.Transformer];
    }
}