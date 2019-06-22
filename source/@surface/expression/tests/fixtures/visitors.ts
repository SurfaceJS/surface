import ArrayExpression       from "../../internal/expressions/array-expression";
import AssignmentExpression  from "../../internal/expressions/assignment-expression";
import BinaryExpression      from "../../internal/expressions/binary-expression";
import CallExpression        from "../../internal/expressions/call-expression";
import ConditionalExpression from "../../internal/expressions/conditional-expression";
import ConstantExpression    from "../../internal/expressions/constant-expression";
import IdentifierExpression  from "../../internal/expressions/identifier-expression";
import MemberExpression      from "../../internal/expressions/member-expression";
import NewExpression         from "../../internal/expressions/new-expression";
import ObjectExpression      from "../../internal/expressions/object-expression";
import PropertyExpression    from "../../internal/expressions/property-expression";
import RegexExpression       from "../../internal/expressions/regex-expression";
import TemplateExpression    from "../../internal/expressions/template-expression";
import UnaryExpression       from "../../internal/expressions/unary-expression";
import UpdateExpression      from "../../internal/expressions/update-expression";

type ValidVisitSpec = { raw: string, value: string, context?: Object };

export const validVisitors: Array<ValidVisitSpec> =
[
    {
        raw: "x = 1",
        value:
        [
            AssignmentExpression.name,
            IdentifierExpression.name,
            ConstantExpression.name,
        ].join(" > ")
    },
    {
        raw: "new Foo",
        value:
        [
            NewExpression.name,
            IdentifierExpression.name,
        ].join(" > ")
    },
    {
        raw: "[1]",
        value:
        [
            ArrayExpression.name,
            ConstantExpression.name
        ].join(" > ")
    },
    {
        raw: "1 + 1",
        value:
        [
            BinaryExpression.name,
            ConstantExpression.name,
            ConstantExpression.name
        ].join(" > ")
    },
    {
        raw: "this.say('Hello World!!!')",
        value:
        [
            CallExpression.name,
            IdentifierExpression.name,
            MemberExpression.name,
            IdentifierExpression.name,
            ConstantExpression.name,
            ConstantExpression.name,
        ].join(" > "),
        context: { this: { say: /* istanbul ignore next */ (message: string) => message } }
    },
    {
        raw: "1 > 2 ? true : false",
        value:
        [
            ConditionalExpression.name,
            BinaryExpression.name,
            ConstantExpression.name,
            ConstantExpression.name,
            ConstantExpression.name,
            ConstantExpression.name,
        ].join(" > ")
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
        raw: "this.id",
        value:
        [
            MemberExpression.name,
            IdentifierExpression.name,
            ConstantExpression.name,
        ].join(" > "),
        context: { this: { id: 1 } }
    },
    {
        raw:   "{ }",
        value: ObjectExpression.name
    },
    {
        raw:   "{ id: 1 }",
        value:
        [
            ObjectExpression.name,
            PropertyExpression.name,
            ConstantExpression.name,
            ConstantExpression.name,
        ].join(" > "),
    },
    {
        raw:   "/foo/",
        value: RegexExpression.name
    },
    {
        raw:   "/foo/.test('foo')",
        value:
        [
            CallExpression.name,
            RegexExpression.name,
            MemberExpression.name,
            RegexExpression.name,
            ConstantExpression.name,
            ConstantExpression.name
        ].join(" > "),
    },
    {
        raw: "`Hello ${'World'}!!!`",
        value:
        [
            TemplateExpression.name,
            ConstantExpression.name
        ].join(" > ")
    },
    {
        raw: "!true",
        value:
        [
            UnaryExpression.name,
            ConstantExpression.name
        ].join(" > ")
    },
    {
        raw: "++{ foo: 1 }.id",
        value:
        [
            UpdateExpression.name,
            MemberExpression.name,
            ObjectExpression.name,
            PropertyExpression.name,
            ConstantExpression.name,
            ConstantExpression.name,
            ConstantExpression.name
        ].join(" > ")
    },
];