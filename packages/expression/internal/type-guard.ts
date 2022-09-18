import type AssignmentProperty       from "./elements/assignment-property.js";
import type Property                 from "./elements/property.js";
import type SpreadElement            from "./elements/spread-element.js";
import type TemplateElement          from "./elements/template-element.js";
import type ArrayExpression          from "./expressions/array-expression.js";
import type ArrowFunctionExpression  from "./expressions/arrow-function-expression.js";
import type AssignmentExpression     from "./expressions/assignment-expression.js";
import type BinaryExpression         from "./expressions/binary-expression.js";
import type CallExpression           from "./expressions/call-expression.js";
import type ChainExpression          from "./expressions/chain-expression.js";
import type ConditionalExpression    from "./expressions/conditional-expression.js";
import type Identifier               from "./expressions/identifier.js";
import type Literal                  from "./expressions/literal.js";
import type LogicalExpression        from "./expressions/logical-expression.js";
import type MemberExpression         from "./expressions/member-expression.js";
import type NewExpression            from "./expressions/new-expression.js";
import type ObjectExpression         from "./expressions/object-expression.js";
import type ParenthesizedExpression  from "./expressions/parenthesized-expression.js";
import type SequenceExpression       from "./expressions/sequence-expression.js";
import type TaggedTemplateExpression from "./expressions/tagged-template-expression.js";
import type TemplateLiteral          from "./expressions/template-literal.js";
import type ThisExpression           from "./expressions/this-expression.js";
import type UnaryExpression          from "./expressions/unary-expression.js";
import type UpdateExpression         from "./expressions/update-expression.js";
import type INode                    from "./interfaces/node.js";
import NodeType                      from "./node-type.js";
import type ArrayPattern             from "./patterns/array-pattern.js";
import type AssignmentPattern        from "./patterns/assignment-pattern.js";
import type ObjectPattern            from "./patterns/object-pattern.js";
import type RestElement              from "./patterns/rest-element.js";

export default class TypeGuard
{
    public static isArrayExpression(node: INode): node is ArrayExpression
    {
        return node.type == NodeType.ArrayExpression;
    }

    public static isArrayPattern(node: INode): node is ArrayPattern
    {
        return node.type == NodeType.ArrayPattern;
    }

    public static isArrowFunctionExpression(node: INode): node is ArrowFunctionExpression
    {
        return node.type == NodeType.ArrowFunctionExpression;
    }

    public static isAssignmentExpression(node: INode): node is AssignmentExpression
    {
        return node.type == NodeType.AssignmentExpression;
    }

    public static isAssignmentProperty(node: INode): node is AssignmentProperty
    {
        return node.type == NodeType.AssignmentProperty;
    }

    public static isAssignmentPattern(node: INode): node is AssignmentPattern
    {
        return node.type == NodeType.AssignmentPattern;
    }

    public static isBinaryExpression(node: INode): node is BinaryExpression
    {
        return node.type == NodeType.BinaryExpression;
    }

    public static isCallExpression(node: INode): node is CallExpression
    {
        return node.type == NodeType.CallExpression;
    }

    public static isChainExpression(node: INode): node is ChainExpression
    {
        return node.type == NodeType.ChainExpression;
    }

    public static isConditionalExpression(node: INode): node is ConditionalExpression
    {
        return node.type == NodeType.ConditionalExpression;
    }

    public static isIdentifier(node: INode): node is Identifier
    {
        return node.type == NodeType.Identifier;
    }

    public static isLiteral(node: INode): node is Literal
    {
        return node.type == NodeType.Literal;
    }

    public static isLogicalExpression(node: INode): node is LogicalExpression
    {
        return node.type == NodeType.LogicalExpression;
    }

    public static isMemberExpression(node: INode): node is MemberExpression
    {
        return node.type == NodeType.MemberExpression;
    }

    public static isNewExpression(node: INode): node is NewExpression
    {
        return node.type == NodeType.NewExpression;
    }

    public static isObjectExpression(node: INode): node is ObjectExpression
    {
        return node.type == NodeType.ObjectExpression;
    }

    public static isObjectPattern(node: INode): node is ObjectPattern
    {
        return node.type == NodeType.ObjectPattern;
    }

    public static isParenthesizedExpression(node: INode): node is ParenthesizedExpression
    {
        return node.type == NodeType.ParenthesizedExpression;
    }

    public static isProperty(node: INode): node is Property
    {
        return node.type == NodeType.Property;
    }

    public static isRestElement(node: INode): node is RestElement
    {
        return node.type == NodeType.RestElement;
    }

    public static isSequenceExpression(node: INode): node is SequenceExpression
    {
        return node.type == NodeType.SequenceExpression;
    }

    public static isSpreadElement(node: INode): node is SpreadElement
    {
        return node.type == NodeType.SpreadElement;
    }

    public static isTaggedTemplateExpression(node: INode): node is TaggedTemplateExpression
    {
        return node.type == NodeType.TaggedTemplateExpression;
    }

    public static isTemplateLiteral(node: INode): node is TemplateLiteral
    {
        return node.type == NodeType.TemplateLiteral;
    }

    public static isTemplateElement(node: INode): node is TemplateElement
    {
        return node.type == NodeType.TemplateElement;
    }

    public static isThisExpression(node: INode): node is ThisExpression
    {
        return node.type == NodeType.ThisExpression;
    }

    public static isUnaryExpression(node: INode): node is UnaryExpression
    {
        return node.type == NodeType.UnaryExpression;
    }

    public static isUpdateExpression(node: INode): node is UpdateExpression
    {
        return node.type == NodeType.UpdateExpression;
    }
}