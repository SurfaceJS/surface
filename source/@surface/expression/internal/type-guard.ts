import IArrayExpression          from "../interfaces/array-expression";
import IArrayPattern             from "../interfaces/array-pattern";
import IArrowFunctionExpression  from "../interfaces/arrow-function-expression";
import IAssignmentExpression     from "../interfaces/assignment-expression";
import IAssignmentPattern        from "../interfaces/assignment-pattern";
import IAssignmentProperty       from "../interfaces/assignment-property";
import IBinaryExpression         from "../interfaces/binary-expression";
import ICallExpression           from "../interfaces/call-expression";
import ICoalesceExpression       from "../interfaces/coalesce-expression";
import IConditionalExpression    from "../interfaces/conditional-expression";
import IIdentifier               from "../interfaces/identifier";
import ILiteral                  from "../interfaces/literal";
import ILogicalExpression        from "../interfaces/logical-expression";
import IMemberExpression         from "../interfaces/member-expression";
import INewExpression            from "../interfaces/new-expression";
import INode                     from "../interfaces/node";
import IObjectExpression         from "../interfaces/object-expression";
import IObjectPattern            from "../interfaces/object-pattern";
import IProperty                 from "../interfaces/property";
import IRegExpLiteral            from "../interfaces/reg-exp-literal";
import IRestElement              from "../interfaces/rest-element";
import ISequenceExpression       from "../interfaces/sequence-expression";
import ISpreadElement            from "../interfaces/spread-element";
import ITaggedTemplateExpression from "../interfaces/tagged-template-expression";
import ITemplateElement          from "../interfaces/template-element";
import ITemplateLiteral          from "../interfaces/template-literal";
import IThisExpression           from "../interfaces/this-expression";
import IUnaryExpression          from "../interfaces/unary-expression";
import IUpdateExpression         from "../interfaces/update-expression";
import NodeType                  from "../node-type";

export default class TypeGuard
{
    public static isArrayExpression(node: INode): node is IArrayExpression
    {
        return node.type == NodeType.ArrayExpression;
    }

    public static isArrayPattern(node: INode): node is IArrayPattern
    {
        return node.type == NodeType.ArrayPattern;
    }

    public static isArrowFunctionExpression(node: INode): node is IArrowFunctionExpression
    {
        return node.type == NodeType.ArrowFunctionExpression;
    }

    public static isAssignmentExpression(node: INode): node is IAssignmentExpression
    {
        return node.type == NodeType.AssignmentExpression;
    }

    public static isAssignmentProperty(node: INode): node is IAssignmentProperty
    {
        return node.type == NodeType.AssignmentProperty;
    }

    public static isAssignmentPattern(node: INode): node is IAssignmentPattern
    {
        return node.type == NodeType.AssignmentPattern;
    }

    public static isBinaryExpression(node: INode): node is IBinaryExpression
    {
        return node.type == NodeType.BinaryExpression;
    }

    public static isCallExpression(node: INode): node is ICallExpression
    {
        return node.type == NodeType.CallExpression;
    }

    public static isCoalesceExpression(node: INode): node is ICoalesceExpression
    {
        return node.type == NodeType.CoalesceExpression;
    }

    public static isConditionalExpression(node: INode): node is IConditionalExpression
    {
        return node.type == NodeType.ConditionalExpression;
    }

    public static isIdentifier(node: INode): node is IIdentifier
    {
        return node.type == NodeType.Identifier;
    }

    public static isLiteral(node: INode): node is ILiteral
    {
        return node.type == NodeType.Literal;
    }

    public static isLogicalExpression(node: INode): node is ILogicalExpression
    {
        return node.type == NodeType.LogicalExpression;
    }

    public static isMemberExpression(node: INode): node is IMemberExpression
    {
        return node.type == NodeType.MemberExpression;
    }

    public static isNewExpression(node: INode): node is INewExpression
    {
        return node.type == NodeType.NewExpression;
    }

    public static isObjectExpression(node: INode): node is IObjectExpression
    {
        return node.type == NodeType.ObjectExpression;
    }

    public static isObjectPattern(node: INode): node is IObjectPattern
    {
        return node.type == NodeType.ObjectPattern;
    }

    public static isProperty(node: INode): node is IProperty
    {
        return node.type == NodeType.Property;
    }

    public static isRegExpLiteral(node: INode): node is IRegExpLiteral
    {
        return node.type == NodeType.RegExpLiteral;
    }

    public static isRestElement(node: INode): node is IRestElement
    {
        return node.type == NodeType.RestElement;
    }

    public static isSequenceExpression(node: INode): node is ISequenceExpression
    {
        return node.type == NodeType.SequenceExpression;
    }

    public static isSpreadElement(node: INode): node is ISpreadElement
    {
        return node.type == NodeType.SpreadElement;
    }

    public static isTaggedTemplateExpression(node: INode): node is ITaggedTemplateExpression
    {
        return node.type == NodeType.TaggedTemplateExpression;
    }

    public static isTemplateLiteral(node: INode): node is ITemplateLiteral
    {
        return node.type == NodeType.TemplateLiteral;
    }

    public static isTemplateElement(node: INode): node is ITemplateElement
    {
        return node.type == NodeType.TemplateElement;
    }

    public static isThisExpression(node: INode): node is IThisExpression
    {
        return node.type == NodeType.ThisExpression;
    }

    public static isUnaryExpression(node: INode): node is IUnaryExpression
    {
        return node.type == NodeType.UnaryExpression;
    }

    public static isUpdateExpression(node: INode): node is IUpdateExpression
    {
        return node.type == NodeType.UpdateExpression;
    }
}