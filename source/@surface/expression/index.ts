import IArrayExpression         from "./interfaces/array-expression";
import IArrayPattern            from "./interfaces/array-pattern";
import IArrowFunctionExpression from "./interfaces/arrow-function-expression";
import IAssignmentExpression    from "./interfaces/assignment-expression";
import IAssignmentPattern       from "./interfaces/assignment-pattern";
import IAssignmentProperty      from "./interfaces/assignment-property";
import IBinaryExpression        from "./interfaces/binary-expression";
import ICallExpression          from "./interfaces/call-expression";
import IConditionalExpression   from "./interfaces/conditional-expression";
import IExpression              from "./interfaces/expression";
import IIdentifier              from "./interfaces/identifier";
import ILiteral                 from "./interfaces/literal";
import ILogicalExpression       from "./interfaces/logical-expression";
import IMemberExpression        from "./interfaces/member-expression";
import INewExpression           from "./interfaces/new-expression";
import IObjectExpression        from "./interfaces/object-expression";
import IObjectPattern           from "./interfaces/object-pattern";
import IPattern                 from "./interfaces/pattern";
import IProperty                from "./interfaces/property";
import IRegExpLiteral           from "./interfaces/reg-exp-literal";
import IRestElement             from "./interfaces/rest-element";
import ISequenceExpression      from "./interfaces/sequence-expression";
import ISpreadElement           from "./interfaces/spread-element";
import ITemplateElement         from "./interfaces/template-element";
import ITemplateLiteral         from "./interfaces/template-literal";
import IThisExpression          from "./interfaces/this-expression";
import IUnaryExpression         from "./interfaces/unary-expression";
import IUpdateExpression        from "./interfaces/update-expression";
import { hasDuplicated }        from "./internal/common";
import AssignmentProperty       from "./internal/elements/assignment-property";
import Property                 from "./internal/elements/property";
import SpreadElement            from "./internal/elements/spread-element";
import TemplateElement          from "./internal/elements/template-element";
import ArrayExpression          from "./internal/expressions/array-expression";
import ArrowFunctionExpression  from "./internal/expressions/arrow-function-expression";
import AssignmentExpression     from "./internal/expressions/assignment-expression";
import BinaryExpression         from "./internal/expressions/binary-expression";
import CallExpression           from "./internal/expressions/call-expression";
import ConditionalExpression    from "./internal/expressions/conditional-expression";
import Identifier               from "./internal/expressions/identifier";
import Literal                  from "./internal/expressions/literal";
import LogicalExpression        from "./internal/expressions/logical-expression";
import MemberExpression         from "./internal/expressions/member-expression";
import NewExpression            from "./internal/expressions/new-expression";
import ObjectExpression         from "./internal/expressions/object-expression";
import RegExpLiteral            from "./internal/expressions/reg-exp-literal";
import SequenceExpression       from "./internal/expressions/sequence-expression";
import TemplateLiteral          from "./internal/expressions/template-literal";
import ThisExpression           from "./internal/expressions/this-expression";
import UnaryExpression          from "./internal/expressions/unary-expression";
import UpdateExpression         from "./internal/expressions/update-expression";
import Messages                 from "./internal/messages";
import Parser                   from "./internal/parser";
import ArrayPattern             from "./internal/patterns/array-pattern";
import AssignmentPattern        from "./internal/patterns/assignment-pattern";
import ObjectPattern            from "./internal/patterns/object-pattern";
import RestElement              from "./internal/patterns/rest-element";
import
{
    AssignmentOperator,
    BinaryOperator,
    LiteralValue,
    LogicalOperator,
    UnaryOperator,
    UpdateOperator
} from "./types";

export default abstract class Expression
{
    public static array(elements: Array<IExpression>): IArrayExpression
    {
        return new ArrayExpression(elements);
    }

    public static arrayPattern(elements: Array<IPattern>): IArrayPattern
    {
        return new ArrayPattern(elements);
    }

    public static arrowFunction(parameters: Array<IPattern>, body: IExpression): IArrowFunctionExpression
    {
        if (hasDuplicated(parameters))
        {
            throw new Error(Messages.duplicateParameterNameNotAllowedInThisContext);
        }

        return new ArrowFunctionExpression(parameters, body);
    }

    public static assignment(left: IExpression, right: IExpression, operator: AssignmentOperator): IAssignmentExpression
    {
        return new AssignmentExpression(left, right, operator);
    }

    public static assignmentPattern(left: IPattern, right: IExpression): IAssignmentPattern
    {
        return new AssignmentPattern(left, right);
    }

    public static assignmentProperty(key: IIdentifier): IAssignmentProperty;
    public static assignmentProperty(key: IExpression, value: IPattern, computed?: boolean): IAssignmentProperty;
    public static assignmentProperty(...args: [IIdentifier]|[IExpression, IPattern, boolean?]): IAssignmentProperty
    {
        return args.length == 1 ?
            new AssignmentProperty(args[0], args[0], true, true)
            : new AssignmentProperty(args[0], args[1], !!args[2], false);
    }

    public static binary(left: IExpression, right: IExpression, operator: BinaryOperator): IBinaryExpression
    {
        return new BinaryExpression(left, right, operator);
    }

    public static call(context: IExpression, callee: IExpression, $arguments?: Array<IExpression>): ICallExpression
    {
        return new CallExpression(context, callee, $arguments || []);
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
        return new LogicalExpression(left, right, operator);
    }

    public static member(object: IExpression, property: IExpression, computed: boolean): IMemberExpression
    {
        return new MemberExpression(object, property, computed);
    }

    public static new(callee: IExpression, $arguments?: Array<IExpression>): INewExpression
    {
        return new NewExpression(callee, $arguments || []);
    }

    public static object(properties?: Array<IProperty>): IObjectExpression
    {
        return new ObjectExpression(properties || []);
    }

    public static objectPattern(properties: Array<IAssignmentProperty|IRestElement>): IObjectPattern
    {
        return new ObjectPattern(properties);
    }

    public static parse(source: string): IExpression
    {
        return Parser.parse(source);
    }

    public static property(key: IIdentifier): IProperty;
    public static property(key: IExpression, value: IExpression, computed?: boolean): IProperty;
    public static property(...args: [IIdentifier]|[IExpression, IExpression, boolean?]): IProperty
    {
        return args.length == 1 ?
            new Property(args[0], args[0], true, true)
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

    public static sequence(expressions: Array<IExpression>): ISequenceExpression
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

    public static template(quasis: Array<ITemplateElement>, expressions: Array<IExpression>): ITemplateLiteral
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

    public static update(argument: IExpression, operator: UpdateOperator, prefix: boolean): IUpdateExpression
    {
        return new UpdateExpression(argument, operator, prefix);
    }
}