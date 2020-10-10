import { hasDuplicated }         from "./common";
import AssignmentProperty        from "./elements/assignment-property";
import Property                  from "./elements/property";
import SpreadElement             from "./elements/spread-element";
import TemplateElement           from "./elements/template-element";
import ArrayExpression           from "./expressions/array-expression";
import ArrowFunctionExpression   from "./expressions/arrow-function-expression";
import AssignmentExpression      from "./expressions/assignment-expression";
import BinaryExpression          from "./expressions/binary-expression";
import CallExpression            from "./expressions/call-expression";
import CoalesceExpression        from "./expressions/coalesce-expression";
import ConditionalExpression     from "./expressions/conditional-expression";
import Identifier                from "./expressions/identifier";
import Literal                   from "./expressions/literal";
import LogicalExpression         from "./expressions/logical-expression";
import MemberExpression          from "./expressions/member-expression";
import NewExpression             from "./expressions/new-expression";
import ObjectExpression          from "./expressions/object-expression";
import ParenthesizedExpression   from "./expressions/parenthesized-expression";
import RegExpLiteral             from "./expressions/reg-exp-literal";
import SequenceExpression        from "./expressions/sequence-expression";
import TaggedTemplateExpression  from "./expressions/tagged-template-expression";
import TemplateLiteral           from "./expressions/template-literal";
import ThisExpression            from "./expressions/this-expression";
import UnaryExpression           from "./expressions/unary-expression";
import UpdateExpression          from "./expressions/update-expression";
import IArrayExpression          from "./interfaces/array-expression";
import IArrayPattern             from "./interfaces/array-pattern";
import IArrowFunctionExpression  from "./interfaces/arrow-function-expression";
import IAssignmentExpression     from "./interfaces/assignment-expression";
import IAssignmentPattern        from "./interfaces/assignment-pattern";
import IAssignmentProperty       from "./interfaces/assignment-property";
import IBinaryExpression         from "./interfaces/binary-expression";
import ICallExpression           from "./interfaces/call-expression";
import ICoalesceExpression       from "./interfaces/coalesce-expression";
import IConditionalExpression    from "./interfaces/conditional-expression";
import IExpression               from "./interfaces/expression";
import IIdentifier               from "./interfaces/identifier";
import ILiteral                  from "./interfaces/literal";
import ILogicalExpression        from "./interfaces/logical-expression";
import IMemberExpression         from "./interfaces/member-expression";
import INewExpression            from "./interfaces/new-expression";
import IObjectExpression         from "./interfaces/object-expression";
import IObjectPattern            from "./interfaces/object-pattern";
import IParenthesizedExpression  from "./interfaces/parenthesized-expression";
import IPattern                  from "./interfaces/pattern";
import IProperty                 from "./interfaces/property";
import IRegExpLiteral            from "./interfaces/reg-exp-literal";
import IRestElement              from "./interfaces/rest-element";
import ISequenceExpression       from "./interfaces/sequence-expression";
import ISpreadElement            from "./interfaces/spread-element";
import ITaggedTemplateExpression from "./interfaces/tagged-template-expression";
import ITemplateElement          from "./interfaces/template-element";
import ITemplateLiteral          from "./interfaces/template-literal";
import IThisExpression           from "./interfaces/this-expression";
import IUnaryExpression          from "./interfaces/unary-expression";
import IUpdateExpression         from "./interfaces/update-expression";
import Messages                  from "./messages";
import Parser                    from "./parser";
import ArrayPattern              from "./patterns/array-pattern";
import AssignmentPattern         from "./patterns/assignment-pattern";
import ObjectPattern             from "./patterns/object-pattern";
import RestElement               from "./patterns/rest-element";
import
{
    AssignmentOperator,
    BinaryOperator,
    LiteralValue,
    LogicalOperator,
    UnaryOperator,
    UpdateOperator,
} from "./types/operators";

export default abstract class Expression
{
    private static wrapParenthesis<T extends IExpression>(expression: T): T
    {
        const clone    = expression.clone;
        const toString = expression.toString;

        expression.clone    = () => Expression.wrapParenthesis(clone.call(expression));
        expression.toString = () => `(${toString.call(expression)})`;

        return expression;
    }

    public static array(elements: IExpression[]): IArrayExpression
    {
        return new ArrayExpression(elements);
    }

    public static arrayPattern(elements: IPattern[]): IArrayPattern
    {
        return new ArrayPattern(elements);
    }

    public static arrowFunction(parameters: IPattern[], body: IExpression): IArrowFunctionExpression
    {
        if (hasDuplicated(parameters))
        {
            throw new Error(Messages.duplicateParameterNameNotAllowedInThisContext);
        }

        return new ArrowFunctionExpression(parameters, body);
    }

    public static assignment(left: IIdentifier | IMemberExpression, right: IExpression, operator: AssignmentOperator): IAssignmentExpression
    {
        return new AssignmentExpression(left, right, operator);
    }

    public static assignmentPattern(left: IPattern, right: IExpression): IAssignmentPattern
    {
        return new AssignmentPattern(left, right);
    }

    public static assignmentProperty(key: IIdentifier): IAssignmentProperty;
    public static assignmentProperty(key: IExpression, value: IPattern, computed?: boolean): IAssignmentProperty;
    public static assignmentProperty(...args: [IIdentifier] | [IExpression, IPattern, boolean?]): IAssignmentProperty
    {
        return args.length == 1
            ? new AssignmentProperty(args[0], args[0], true, true)
            : new AssignmentProperty(args[0], args[1], !!args[2], false);
    }

    public static binary(left: IExpression, right: IExpression, operator: BinaryOperator): IBinaryExpression
    {
        return Expression.wrapParenthesis(new BinaryExpression(left, right, operator));
    }

    public static call(callee: IExpression, $arguments?: IExpression[]): ICallExpression
    {
        return new CallExpression(callee, $arguments ?? []);
    }

    public static coalesce(left: IExpression, right: IExpression): ICoalesceExpression
    {
        return Expression.wrapParenthesis(new CoalesceExpression(left, right));
    }

    public static conditional(condition: IExpression, alternate: IExpression, consequent: IExpression): IConditionalExpression
    {
        return new ConditionalExpression(condition, alternate, consequent);
    }

    public static identifier(name: string): IIdentifier
    {
        return new Identifier(name);
    }

    public static literal(value: LiteralValue): ILiteral
    {
        return new Literal(value);
    }

    public static logical(left: IExpression, right: IExpression, operator: LogicalOperator): ILogicalExpression
    {
        return Expression.wrapParenthesis(new LogicalExpression(left, right, operator));
    }

    public static member(object: IExpression, property: IExpression, computed: boolean): IMemberExpression
    {
        return new MemberExpression(object, property, computed);
    }

    public static new(callee: IExpression, $arguments?: IExpression[]): INewExpression
    {
        return new NewExpression(callee, $arguments ?? []);
    }

    public static object(properties?: IProperty[]): IObjectExpression
    {
        return new ObjectExpression(properties ?? []);
    }

    public static objectPattern(properties: (IAssignmentProperty | IRestElement)[]): IObjectPattern
    {
        return new ObjectPattern(properties);
    }

    public static parse(source: string): IExpression
    {
        return Parser.parse(source);
    }

    public static parenthesized(argument: IExpression): IParenthesizedExpression
    {
        return new ParenthesizedExpression(argument);
    }

    public static property(key: IIdentifier): IProperty;
    public static property(key: IExpression, value: IExpression, computed?: boolean): IProperty;
    public static property(...args: [IIdentifier] | [IExpression, IExpression, boolean?]): IProperty
    {
        return args.length == 1
            ? new Property(args[0], args[0], true, true)
            : new Property(args[0], args[1], !!args[2], false);
    }

    public static regex(pattern: string, flags: string): IRegExpLiteral
    {
        return new RegExpLiteral(pattern, flags);
    }

    public static rest(argument: IPattern): IRestElement
    {
        return new RestElement(argument);
    }

    public static sequence(expressions: IExpression[]): ISequenceExpression
    {
        return new SequenceExpression(expressions);
    }

    public static spread(argument: IExpression): ISpreadElement
    {
        return new SpreadElement(argument);
    }

    public static this(): IThisExpression
    {
        return new ThisExpression();
    }

    public static taggedTemplate(callee: IExpression, quasi: TemplateLiteral): ITaggedTemplateExpression
    {
        return new TaggedTemplateExpression(callee, quasi);
    }

    public static template(quasis: ITemplateElement[], expressions: IExpression[]): ITemplateLiteral
    {
        return new TemplateLiteral(quasis, expressions);
    }

    public static templateElement(cooked: string, raw: string, tail: boolean): ITemplateElement
    {
        return new TemplateElement(cooked, raw, tail);
    }

    public static unary(argument: IExpression, operator: UnaryOperator): IUnaryExpression
    {
        return new UnaryExpression(argument, operator);
    }

    public static update(argument: IIdentifier | IMemberExpression, operator: UpdateOperator, prefix: boolean): IUpdateExpression
    {
        return new UpdateExpression(argument, operator, prefix);
    }
}