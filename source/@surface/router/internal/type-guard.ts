import NodeType             from "./enums/node-type.js";
import type INode           from "./interfaces/node.js";
import type AssignmentNode  from "./nodes/assignment-node.js";
import type IdentifierNode  from "./nodes/identifier-node.js";
import type LiteralNode     from "./nodes/literal-node.js";
import type RestNode        from "./nodes/rest-node.js";
import type TransformerNode from "./nodes/transformer-node.js";
import type WildcardNode    from "./nodes/wildcard-node.js";

export default class TypeGuard
{
    public static isAssignment(node: INode): node is AssignmentNode
    {
        return node.type == NodeType.Assignment;
    }

    public static isIdentifier(node: INode): node is IdentifierNode
    {
        return node.type == NodeType.Identifier;
    }

    public static isLiteral(node: INode): node is LiteralNode
    {
        return node.type == NodeType.Literal;
    }

    public static isRest(node: INode): node is RestNode
    {
        return node.type == NodeType.Rest;
    }

    public static isTransformer(node: INode): node is TransformerNode
    {
        return node.type == NodeType.Transformer;
    }

    public static isWildcard(node: INode): node is WildcardNode
    {
        return node.type == NodeType.Wildcard;
    }
}