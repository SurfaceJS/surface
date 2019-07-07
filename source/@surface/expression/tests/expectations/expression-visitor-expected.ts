import Property              from "../../internal/elements/property";
import TemplateElement       from "../../internal/elements/template-element";
import ArrayExpression       from "../../internal/expressions/array-expression";
import AssignmentExpression  from "../../internal/expressions/assignment-expression";
import BinaryExpression      from "../../internal/expressions/binary-expression";
import CallExpression        from "../../internal/expressions/call-expression";
import ConditionalExpression from "../../internal/expressions/conditional-expression";
import Identifier            from "../../internal/expressions/identifier";
import Literal               from "../../internal/expressions/literal";
import MemberExpression      from "../../internal/expressions/member-expression";
import NewExpression         from "../../internal/expressions/new-expression";
import ObjectExpression      from "../../internal/expressions/object-expression";
import TemplateLiteral       from "../../internal/expressions/template-literal";
import ThisExpression        from "../../internal/expressions/this-expression";
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
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "new Foo",
        value:
        [
            NewExpression.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "[1]",
        value:
        [
            ArrayExpression.name,
            Literal.name
        ].join(" > ")
    },
    {
        raw: "1 + 1",
        value:
        [
            BinaryExpression.name,
            Literal.name,
            Literal.name
        ].join(" > ")
    },
    {
        raw: "this.say('Hello World!!!')",
        value:
        [
            CallExpression.name,
            ThisExpression.name,
            MemberExpression.name,
            ThisExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
        context: { this: { say: /* istanbul ignore next */ (message: string) => message } }
    },
    {
        raw: "1 > 2 ? true : false",
        value:
        [
            ConditionalExpression.name,
            BinaryExpression.name,
            Literal.name,
            Literal.name,
            Literal.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw:   "1",
        value: Literal.name
    },
    {
        raw:     "this",
        value:   ThisExpression.name,
        context: { this: { } }
    },
    {
        raw: "this.id",
        value:
        [
            MemberExpression.name,
            ThisExpression.name,
            Identifier.name,
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
            Property.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "/foo/",
        value: Literal.name
    },
    {
        raw:   "/foo/.test('foo')",
        value:
        [
            CallExpression.name,
            Literal.name,
            MemberExpression.name,
            Literal.name,
            Identifier.name,
            Literal.name
        ].join(" > "),
    },
    {
        raw: "`Hello ${'World'}!!!`",
        value:
        [
            TemplateLiteral.name,
            TemplateElement.name,
            TemplateElement.name,
            Literal.name
        ].join(" > ")
    },
    {
        raw: "!true",
        value:
        [
            UnaryExpression.name,
            Literal.name
        ].join(" > ")
    },
    {
        raw: "++{ foo: 1 }.id",
        value:
        [
            UpdateExpression.name,
            MemberExpression.name,
            ObjectExpression.name,
            Property.name,
            Identifier.name,
            Literal.name,
            Identifier.name
        ].join(" > ")
    },
];