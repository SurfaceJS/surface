import ArrayExpression       from "../../internal/expressions/array-expression";
import BinaryExpression      from "../../internal/expressions/binary-expression";
import CallExpression        from "../../internal/expressions/call-expression";
import ConditionalExpression from "../../internal/expressions/conditional-expression";
import ConstantExpression    from "../../internal/expressions/constant-expression";
import IdentifierExpression  from "../../internal/expressions/identifier-expression";
import MemberExpression      from "../../internal/expressions/member-expression";
import ObjectExpression      from "../../internal/expressions/object-expression";
import RegexExpression       from "../../internal/expressions/regex-expression";
import TemplateExpression    from "../../internal/expressions/template-expression";
import UnaryExpression       from "../../internal/expressions/unary-expression";
import UpdateExpression      from "../../internal/expressions/update-expression";

type ValidVisitSpec = { raw: string, value: string, context?: Object };

export const validVisitors: Array<ValidVisitSpec> =
[
    {
        raw:  "[1]",
        value: ArrayExpression.name
    },
    {
        raw:  "1 + 1",
        value: BinaryExpression.name
    },
    {
        raw:     "this.say('Hello World!!!')",
        value:   CallExpression.name,
        context: { this: { say: /* istanbul ignore next */ (message: string) => message } }
    },
    {
        raw:   "1 > 2 ? true : false",
        value: ConditionalExpression.name
    },
    {
        raw:   "1",
        value: ConstantExpression.name
    },
    {
        raw:     "this",
        value:   IdentifierExpression.name,
        context: { this: { } }
    },
    {
        raw:     "this.id",
        value:   MemberExpression.name,
        context: { this: { id: 1 } }
    },
    {
        raw:  "{ }",
        value: ObjectExpression.name
    },
    {
        raw:  "/foo/",
        value: RegexExpression.name
    },
    {
        raw:  "`Hello ${'World'}!!!`",
        value: TemplateExpression.name
    },
    {
        raw:  "!true",
        value: UnaryExpression.name
    },
    {
        raw:  "++{ foo: 1 }.id",
        value: UpdateExpression.name
    },
];