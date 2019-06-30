import ExpressionType              from "../expression-type";
import IExpression                 from "../interfaces/expression";
import ArrayDestructureExpression  from "./expressions/array-destructure-expression";
import ArrayExpression             from "./expressions/array-expression";
import AssignmentExpression        from "./expressions/assignment-expression";
import BinaryExpression            from "./expressions/binary-expression";
import CallExpression              from "./expressions/call-expression";
import ConditionalExpression       from "./expressions/conditional-expression";
import ConstantExpression          from "./expressions/constant-expression";
import IdentifierExpression        from "./expressions/identifier-expression";
import MemberExpression            from "./expressions/member-expression";
import NewExpression               from "./expressions/new-expression";
import ObjectDestructureExpression from "./expressions/object-destructure-expression";
import ObjectExpression            from "./expressions/object-expression";
import PropertyExpression          from "./expressions/property-expression";
import RegexExpression             from "./expressions/regex-expression";
import RestExpression              from "./expressions/rest-expression";
import SpreadExpression            from "./expressions/spread-expression";
import TemplateExpression          from "./expressions/template-expression";
import UnaryExpression             from "./expressions/unary-expression";
import UpdateExpression            from "./expressions/update-expression";

export default class TypeGuard
{
    public static isArrayExpression(target: IExpression): target is ArrayExpression
    {
        return target.type == ExpressionType.Array;
    }

    public static isArrayDestructureExpression(target: IExpression): target is ArrayDestructureExpression
    {
        return target.type == ExpressionType.ArrayDestructure;
    }

    public static isAssignmentExpression(target: IExpression): target is AssignmentExpression
    {
        return target.type == ExpressionType.Assignment;
    }

    public static isBinaryExpression(target: IExpression): target is BinaryExpression
    {
        return target.type == ExpressionType.Binary;
    }

    public static isCallExpression(target: IExpression): target is CallExpression
    {
        return target.type == ExpressionType.Call;
    }

    public static isConditionalExpression(target: IExpression): target is ConditionalExpression
    {
        return target.type == ExpressionType.Conditional;
    }

    public static isConstantExpression(target: IExpression): target is ConstantExpression
    {
        return target.type == ExpressionType.Constant;
    }

    public static isIdentifierExpression(target: IExpression): target is IdentifierExpression
    {
        return target.type == ExpressionType.Identifier;
    }

    public static isMemberExpression(target: IExpression): target is MemberExpression
    {
        return target.type == ExpressionType.Member;
    }

    public static isNewExpression(target: IExpression): target is NewExpression
    {
        return target.type == ExpressionType.New;
    }

    public static isObjectExpression(target: IExpression): target is ObjectExpression
    {
        return target.type == ExpressionType.Object;
    }

    public static isObjectDestructureExpression(target: IExpression): target is ObjectDestructureExpression
    {
        return target.type == ExpressionType.ObjectDestructure;
    }

    public static isPropertyExpression(target: IExpression): target is PropertyExpression
    {
        return target.type == ExpressionType.Property;
    }

    public static isRegexExpression(target: IExpression): target is RegexExpression
    {
        return target.type == ExpressionType.Regex;
    }

    public static isRestExpression(target: IExpression): target is RestExpression
    {
        return target.type == ExpressionType.Rest;
    }

    public static isSpreadExpression(target: IExpression): target is SpreadExpression
    {
        return target.type == ExpressionType.Spread;
    }

    public static isTemplateExpression(target: IExpression): target is TemplateExpression
    {
        return target.type == ExpressionType.Template;
    }

    public static isUnaryExpression(target: IExpression): target is UnaryExpression
    {
        return target.type == ExpressionType.Unary;
    }

    public static isUpdateExpression(target: IExpression): target is UpdateExpression
    {
        return target.type == ExpressionType.Update;
    }
}