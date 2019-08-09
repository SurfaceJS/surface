import AssignmentProperty       from "../../internal/elements/assignment-property";
import Property                 from "../../internal/elements/property";
import SpreadElement            from "../../internal/elements/spread-element";
import TemplateElement          from "../../internal/elements/template-element";
import ArrayExpression          from "../../internal/expressions/array-expression";
import ArrowFunctionExpression  from "../../internal/expressions/arrow-function-expression";
import AssignmentExpression     from "../../internal/expressions/assignment-expression";
import BinaryExpression         from "../../internal/expressions/binary-expression";
import CallExpression           from "../../internal/expressions/call-expression";
import CoalesceExpression       from "../../internal/expressions/coalesce-expression";
import ConditionalExpression    from "../../internal/expressions/conditional-expression";
import Identifier               from "../../internal/expressions/identifier";
import Literal                  from "../../internal/expressions/literal";
import LogicalExpression        from "../../internal/expressions/logical-expression";
import MemberExpression         from "../../internal/expressions/member-expression";
import NewExpression            from "../../internal/expressions/new-expression";
import ObjectExpression         from "../../internal/expressions/object-expression";
import ParenthesizedExpression  from "../../internal/expressions/parenthesized-expression";
import SequenceExpression       from "../../internal/expressions/sequence-expression";
import TaggedTemplateExpression from "../../internal/expressions/tagged-template-expression";
import TemplateLiteral          from "../../internal/expressions/template-literal";
import ThisExpression           from "../../internal/expressions/this-expression";
import UnaryExpression          from "../../internal/expressions/unary-expression";
import UpdateExpression         from "../../internal/expressions/update-expression";
import ArrayPattern             from "../../internal/patterns/array-pattern";
import AssignmentPattern        from "../../internal/patterns/assignment-pattern";
import ObjectPattern            from "../../internal/patterns/object-pattern";
import RestElement              from "../../internal/patterns/rest-element";

type ValidVisitSpec = { raw: string, value: string, context?: Object };

export const validVisitors: Array<ValidVisitSpec> =
[
    {
        raw: "[1]",
        value:
        [
            ArrayExpression.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "[, 1]",
        value:
        [
            ArrayExpression.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "([a]) => a",
        value:
        [
            ArrowFunctionExpression.name,
            ArrayPattern.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "([, a]) => a",
        value:
        [
            ArrowFunctionExpression.name,
            ArrayPattern.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
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
        raw: "(x = 1) => x",
        value:
        [
            ArrowFunctionExpression.name,
            AssignmentPattern.name,
            Identifier.name,
            Literal.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "x + 1",
        value:
        [
            BinaryExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "x + 1",
        value:
        [
            BinaryExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "f(1)",
        value:
        [
            CallExpression.name,
            Literal.name,
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "x ?? y",
        value:
        [
            CoalesceExpression.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "x != null ? x : true",
        value:
        [
            ConditionalExpression.name,
            BinaryExpression.name,
            Identifier.name,
            Literal.name,
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "x || false",
        value:
        [
            LogicalExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "x.y",
        value:
        [
            MemberExpression.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "new f(1)",
        value:
        [
            NewExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > ")
    },
    {
        raw: "({ x: 1 })",
        value:
        [
            ParenthesizedExpression.name,
            ObjectExpression.name,
            Property.name,
            Identifier.name,
            Literal.name
        ].join(" > ")
    },
    {
        raw: "({ x }) => x",
        value:
        [
            ArrowFunctionExpression.name,
            ObjectPattern.name,
            AssignmentProperty.name,
            Identifier.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "(...x) => x",
        value:
        [
            ArrowFunctionExpression.name,
            RestElement.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "(x, y)",
        value:
        [
            SequenceExpression.name,
            Identifier.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "f(...x)",
        value:
        [
            CallExpression.name,
            Literal.name,
            Identifier.name,
            SpreadElement.name,
            Identifier.name,
        ].join(" > ")
    },
    {
        raw: "tag`Hello: ${'World'}!!!`",
        value:
        [
            TaggedTemplateExpression.name,
            Literal.name,
            Identifier.name,
            TemplateLiteral.name,
            TemplateElement.name,
            TemplateElement.name,
            Literal.name
        ].join(" > ")
    },
    {
        raw: "`Hello: ${ x }`",
        value:
        [
            TemplateLiteral.name,
            TemplateElement.name,
            TemplateElement.name,
            Identifier.name
        ].join(" > ")
    },
    {
        raw: "this",
        value:
        [
            ThisExpression.name,
        ].join(" > ")
    },
    {
        raw: "x++",
        value:
        [
            UpdateExpression.name,
            Identifier.name
        ].join(" > ")
    },
    {
        raw: "!x",
        value:
        [
            UnaryExpression.name,
            Identifier.name
        ].join(" > ")
    }
];