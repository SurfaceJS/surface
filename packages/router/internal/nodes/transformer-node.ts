import NodeType            from "../enums/node-type.js";
import type INode          from "../interfaces/node.js";
import TypeGuard           from "../type-guard.js";
import type AssignmentNode from "./assignment-node.js";
import type IdentifierNode from "./identifier-node.js";

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
        return NodeType[NodeType.Transformer]!;
    }
}
