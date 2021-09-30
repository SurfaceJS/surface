import { hasDuplicated }              from "./common.js";
import AssignmentProperty             from "./elements/assignment-property.js";
import Property                       from "./elements/property.js";
import SpreadElement                  from "./elements/spread-element.js";
import TemplateElement                from "./elements/template-element.js";
import ArrayExpression                from "./expressions/array-expression.js";
import ArrowFunctionExpression        from "./expressions/arrow-function-expression.js";
import AssignmentExpression           from "./expressions/assignment-expression.js";
import BinaryExpression               from "./expressions/binary-expression.js";
import CallExpression                 from "./expressions/call-expression.js";
import ChainExpression                from "./expressions/chain-expression.js";
import ConditionalExpression          from "./expressions/conditional-expression.js";
import Identifier                     from "./expressions/identifier.js";
import Literal                        from "./expressions/literal.js";
import LogicalExpression              from "./expressions/logical-expression.js";
import MemberExpression               from "./expressions/member-expression.js";
import NewExpression                  from "./expressions/new-expression.js";
import ObjectExpression               from "./expressions/object-expression.js";
import ParenthesizedExpression        from "./expressions/parenthesized-expression.js";
import RegExpLiteral                  from "./expressions/reg-exp-literal.js";
import SequenceExpression             from "./expressions/sequence-expression.js";
import TaggedTemplateExpression       from "./expressions/tagged-template-expression.js";
import TemplateLiteral                from "./expressions/template-literal.js";
import ThisExpression                 from "./expressions/this-expression.js";
import UnaryExpression                from "./expressions/unary-expression.js";
import UpdateExpression               from "./expressions/update-expression.js";
import type IArrayExpression          from "./interfaces/array-expression";
import type IArrayPattern             from "./interfaces/array-pattern";
import type IArrowFunctionExpression  from "./interfaces/arrow-function-expression";
import type IAssignmentExpression     from "./interfaces/assignment-expression";
import type IAssignmentPattern        from "./interfaces/assignment-pattern";
import type IAssignmentProperty       from "./interfaces/assignment-property";
import type IBinaryExpression         from "./interfaces/binary-expression";
import type ICallExpression           from "./interfaces/call-expression";
import type IChainExpression          from "./interfaces/chain-expression.js";
import type IConditionalExpression    from "./interfaces/conditional-expression";
import type IExpression               from "./interfaces/expression";
import type IIdentifier               from "./interfaces/identifier";
import type ILiteral                  from "./interfaces/literal";
import type ILogicalExpression        from "./interfaces/logical-expression";
import type IMemberExpression         from "./interfaces/member-expression";
import type INewExpression            from "./interfaces/new-expression";
import type IObjectExpression         from "./interfaces/object-expression";
import type IObjectPattern            from "./interfaces/object-pattern";
import type IParenthesizedExpression  from "./interfaces/parenthesized-expression";
import type IPattern                  from "./interfaces/pattern";
import type IProperty                 from "./interfaces/property";
import type IRegExpLiteral            from "./interfaces/reg-exp-literal";
import type IRestElement              from "./interfaces/rest-element";
import type ISequenceExpression       from "./interfaces/sequence-expression";
import type ISpreadElement            from "./interfaces/spread-element";
import type ITaggedTemplateExpression from "./interfaces/tagged-template-expression";
import type ITemplateElement          from "./interfaces/template-element";
import type ITemplateLiteral          from "./interfaces/template-literal";
import type IThisExpression           from "./interfaces/this-expression";
import type IUnaryExpression          from "./interfaces/unary-expression";
import type IUpdateExpression         from "./interfaces/update-expression";
import Messages                       from "./messages.js";
import Parser                         from "./parser.js";
import ArrayPattern                   from "./patterns/array-pattern.js";
import AssignmentPattern              from "./patterns/assignment-pattern.js";
import ObjectPattern                  from "./patterns/object-pattern.js";
import RestElement                    from "./patterns/rest-element.js";
import type
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

    public static array(elements: (IExpression | ISpreadElement | null)[]): IArrayExpression
    {
        return new ArrayExpression(elements);
    }

    public static arrayPattern(elements: (IPattern | null)[]): IArrayPattern
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

    public static assignmentProperty(key: IExpression, value?: IPattern, computed?: boolean, shorthand?: boolean): IAssignmentProperty
    {
        return new AssignmentProperty(key, value ?? key as IIdentifier, computed ?? !value, shorthand ?? !value);
    }

    public static binary(left: IExpression, right: IExpression, operator: BinaryOperator): IBinaryExpression
    {
        return Expression.wrapParenthesis(new BinaryExpression(left, right, operator));
    }

    public static call(callee: IExpression, $arguments?: IExpression[]): ICallExpression
    {
        return new CallExpression(callee, $arguments ?? []);
    }

    public static chain(expression: IExpression): IChainExpression
    {
        return new ChainExpression(expression);
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

    public static member(object: IExpression, property: IExpression, computed: boolean, optional: boolean): IMemberExpression
    {
        return new MemberExpression(object, property, computed, optional);
    }

    public static new(callee: IExpression, $arguments?: IExpression[]): INewExpression
    {
        return new NewExpression(callee, $arguments ?? []);
    }

    public static object(properties?: (IProperty | ISpreadElement)[]): IObjectExpression
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

    public static property(key: IExpression, value?: IExpression, computed?: boolean, shorthand?: boolean): IProperty
    {
        return new Property(key, value ?? key as IIdentifier, computed ?? !value, shorthand ?? !value);
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