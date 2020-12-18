import type IArrayExpression          from "./interfaces/array-expression.js";
import type IArrayPattern             from "./interfaces/array-pattern.js";
import type IArrowFunctionExpression  from "./interfaces/arrow-function-expression.js";
import type IAssignmentExpression     from "./interfaces/assignment-expression.js";
import type IAssignmentPattern        from "./interfaces/assignment-pattern.js";
import type IAssignmentProperty       from "./interfaces/assignment-property.js";
import type IBinaryExpression         from "./interfaces/binary-expression.js";
import type ICallExpression           from "./interfaces/call-expression.js";
import type ICoalesceExpression       from "./interfaces/coalesce-expression.js";
import type IConditionalExpression    from "./interfaces/conditional-expression.js";
import type IIdentifier               from "./interfaces/identifier.js";
import type ILiteral                  from "./interfaces/literal.js";
import type ILogicalExpression        from "./interfaces/logical-expression.js";
import type IMemberExpression         from "./interfaces/member-expression.js";
import type INewExpression            from "./interfaces/new-expression.js";
import type INode                     from "./interfaces/node.js";
import type IObjectExpression         from "./interfaces/object-expression.js";
import type IObjectPattern            from "./interfaces/object-pattern.js";
import type IParenthesizedExpression  from "./interfaces/parenthesized-expression.js";
import type IProperty                 from "./interfaces/property.js";
import type IRegExpLiteral            from "./interfaces/reg-exp-literal.js";
import type IRestElement              from "./interfaces/rest-element.js";
import type ISequenceExpression       from "./interfaces/sequence-expression.js";
import type ISpreadElement            from "./interfaces/spread-element.js";
import type ITaggedTemplateExpression from "./interfaces/tagged-template-expression.js";
import type ITemplateElement          from "./interfaces/template-element.js";
import type ITemplateLiteral          from "./interfaces/template-literal.js";
import type IThisExpression           from "./interfaces/this-expression.js";
import type IUnaryExpression          from "./interfaces/unary-expression.js";
import type IUpdateExpression         from "./interfaces/update-expression.js";
import NodeType                       from "./node-type.js";

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

    public static isParenthesizedExpression(node: INode): node is IParenthesizedExpression
    {
        return node.type == NodeType.ParenthesizedExpression;
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