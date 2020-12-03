import NodeType        from "./enums/node-type";
import INode           from "./interfaces/node";
import AssignmentNode  from "./nodes/assignment-node";
import IdentifierNode  from "./nodes/identifier-node";
import LiteralNode     from "./nodes/literal-node";
import RestNode        from "./nodes/rest-node";
import TransformerNode from "./nodes/transformer-node";
import WildcardNode    from "./nodes/wildcard-node";

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