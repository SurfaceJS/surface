import IArrayExpression       from "../interfaces/array-expression";
import IArrayPattern          from "../interfaces/array-pattern";
import IAssignmentExpression  from "../interfaces/assignment-expression";
import IAssignmentPattern     from "../interfaces/assignment-pattern";
import IBinaryExpression      from "../interfaces/binary-expression";
import ICallExpression        from "../interfaces/call-expression";
import IConditionalExpression from "../interfaces/conditional-expression";
import IConstantExpression    from "../interfaces/constant-expression";
import IIdentifierExpression  from "../interfaces/identifier-expression";
import ILogicalExpression     from "../interfaces/logical-expression";
import IMemberExpression      from "../interfaces/member-expression";
import INewExpression         from "../interfaces/new-expression";
import INode                  from "../interfaces/node";
import IObjectExpression      from "../interfaces/object-expression";
import IObjectPattern         from "../interfaces/object-pattern";
import IProperty              from "../interfaces/property";
import IRegexExpression       from "../interfaces/regex-expression";
import IRestElement           from "../interfaces/rest-element";
import ISequenceExpression    from "../interfaces/sequence-expression";
import ISpreadElement         from "../interfaces/spread-element";
import ITemplateExpression    from "../interfaces/template-expression";
import IUnaryExpression       from "../interfaces/unary-expression";
import IUpdateExpression      from "../interfaces/update-expression";
import NodeType               from "../node-type";

export default class TypeGuard
{
    public static isArrayExpression(node: INode): node is IArrayExpression
    {
        return node.type == NodeType.Array;
    }

    public static isArrayPattern(node: INode): node is IArrayPattern
    {
        return node.type == NodeType.ArrayPattern;
    }

    public static isAssignmentExpression(node: INode): node is IAssignmentExpression
    {
        return node.type == NodeType.Assignment;
    }

    public static isAssignmentPattern(node: INode): node is IAssignmentPattern
    {
        return node.type == NodeType.Assignment;
    }

    public static isBinaryExpression(node: INode): node is IBinaryExpression
    {
        return node.type == NodeType.Binary;
    }

    public static isCallExpression(node: INode): node is ICallExpression
    {
        return node.type == NodeType.Call;
    }

    public static isConditionalExpression(node: INode): node is IConditionalExpression
    {
        return node.type == NodeType.Conditional;
    }

    public static isConstantExpression(node: INode): node is IConstantExpression
    {
        return node.type == NodeType.Constant;
    }

    public static isIdentifierExpression(node: INode): node is IIdentifierExpression
    {
        return node.type == NodeType.Identifier;
    }

    public static isLogicalExpression(node: INode): node is ILogicalExpression
    {
        return node.type == NodeType.Logical;
    }

    public static isMemberExpression(node: INode): node is IMemberExpression
    {
        return node.type == NodeType.Member;
    }

    public static isNewExpression(node: INode): node is INewExpression
    {
        return node.type == NodeType.New;
    }

    public static isObjectExpression(node: INode): node is IObjectExpression
    {
        return node.type == NodeType.Object;
    }

    public static isObjectPattern(node: INode): node is IObjectPattern
    {
        return node.type == NodeType.ObjectPattern;
    }

    public static isProperty(node: INode): node is IProperty
    {
        return node.type == NodeType.Property;
    }

    public static isRegexExpression(node: INode): node is IRegexExpression
    {
        return node.type == NodeType.Regex;
    }

    public static isRestElement(node: INode): node is IRestElement
    {
        return node.type == NodeType.Rest;
    }

    public static isSequenceExpression(node: INode): node is ISequenceExpression
    {
        return node.type == NodeType.Sequence;
    }

    public static isSpreadElement(node: INode): node is ISpreadElement
    {
        return node.type == NodeType.Spread;
    }

    public static isTemplateExpression(node: INode): node is ITemplateExpression
    {
        return node.type == NodeType.Template;
    }

    public static isUnaryExpression(node: INode): node is IUnaryExpression
    {
        return node.type == NodeType.Unary;
    }

    public static isUpdateExpression(node: INode): node is IUpdateExpression
    {
        return node.type == NodeType.Update;
    }
}