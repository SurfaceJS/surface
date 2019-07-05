import { Indexer }            from "@surface/core";
import IArrayExpression       from "./interfaces/array-expression";
import IAssignmentExpression  from "./interfaces/assignment-expression";
import IBinaryExpression      from "./interfaces/binary-expression";
import ICallExpression        from "./interfaces/call-expression";
import IConditionalExpression from "./interfaces/conditional-expression";
import IConstantExpression    from "./interfaces/constant-expression";
import IExpression            from "./interfaces/expression";
import IIdentifierExpression  from "./interfaces/identifier-expression";
import IMemberExpression      from "./interfaces/member-expression";
import INewExpression         from "./interfaces/new-expression";
import IObjectExpression      from "./interfaces/object-expression";
import IProperty              from "./interfaces/property";
import IRegexExpression       from "./interfaces/regex-expression";
import ISequenceExpression    from "./interfaces/sequence-expression";
import ISpreadElement         from "./interfaces/spread-element";
import ITemplateExpression    from "./interfaces/template-expression";
import IUnaryExpression       from "./interfaces/unary-expression";
import IUpdateExpression      from "./interfaces/update-expression";
import Property               from "./internal/elements/property";
import SpreadElement          from "./internal/elements/spread-element";
import ArrayExpression        from "./internal/expressions/array-expression";
import AssignmentExpression   from "./internal/expressions/assignment-expression";
import BinaryExpression       from "./internal/expressions/binary-expression";
import CallExpression         from "./internal/expressions/call-expression";
import ConditionalExpression  from "./internal/expressions/conditional-expression";
import ConstantExpression     from "./internal/expressions/constant-expression";
import IdentifierExpression   from "./internal/expressions/identifier-expression";
import MemberExpression       from "./internal/expressions/member-expression";
import NewExpression          from "./internal/expressions/new-expression";
import ObjectExpression       from "./internal/expressions/object-expression";
import RegexExpression        from "./internal/expressions/regex-expression";
import SequenceExpression     from "./internal/expressions/sequence-expression";
import TemplateExpression     from "./internal/expressions/template-expression";
import UnaryExpression        from "./internal/expressions/unary-expression";
import UpdateExpression       from "./internal/expressions/update-expression";
import Parser                 from "./internal/parser";
import
{
    AssignmentOperator,
    BinaryOperator,
    UnaryOperator,
    UpdateOperator
} from "./types";

export default abstract class Expression
{
    public static array(elements: Array<IExpression>): IArrayExpression
    {
        return new ArrayExpression(elements);
    }

    public static assignment(left: IExpression, right: IExpression, operator: AssignmentOperator): IAssignmentExpression
    {
        return new AssignmentExpression(left, right, operator);
    }

    public static binary(left: IExpression, right: IExpression, operator: BinaryOperator): IBinaryExpression
    {
        return new BinaryExpression(left, right, operator);
    }

    public static call(context: IExpression, callee: IExpression, $arguments: Array<IExpression>): ICallExpression
    {
        return new CallExpression(context, callee, $arguments);
    }

    public static conditional(condition: IExpression, alternate: IExpression, consequent: IExpression): IConditionalExpression
    {
        return new ConditionalExpression(condition, alternate, consequent);
    }

    public static constant(value: unknown): IConstantExpression
    {
        return new ConstantExpression(value);
    }

    public static from(source: string, context?: object): IExpression
    {
        return Parser.parse(source, context || { });
    }

    public static identifier(context: object, name: string): IIdentifierExpression
    {
        return new IdentifierExpression(context as Indexer, name);
    }

    public static member(object: IExpression, property: IExpression, computed: boolean): IMemberExpression
    {
        return new MemberExpression(object, property, computed);
    }

    public static new(callee: IExpression, $arguments: Array<IExpression>): INewExpression
    {
        return new NewExpression(callee, $arguments);
    }

    public static object(properties: Array<IProperty>): IObjectExpression
    {
        return new ObjectExpression(properties);
    }

    public static property(key: IExpression, value: IExpression, computed: boolean): IProperty
    {
        return new Property(key, value, computed, false);
    }

    public static regex(pattern: string, flags: string): IRegexExpression
    {
        return new RegexExpression(pattern, flags);
    }

    public static sequence(expressions: Array<IExpression>): ISequenceExpression
    {
        return new SequenceExpression(expressions);
    }

    public static spread(argument: IExpression): ISpreadElement
    {
        return new SpreadElement(argument);
    }

    public static template(quasis: Array<string>, expressions: Array<IExpression>): ITemplateExpression
    {
        return new TemplateExpression(quasis, expressions);
    }

    public static unary(argument: IExpression, operator: UnaryOperator): IUnaryExpression
    {
        return new UnaryExpression(argument, operator);
    }

    public static update(argument: IExpression, operator: UpdateOperator, prefix: boolean): IUpdateExpression
    {
        return new UpdateExpression(argument, operator, prefix);
    }
}