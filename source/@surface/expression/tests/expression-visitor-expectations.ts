/* eslint-disable no-template-curly-in-string */
import AssignmentProperty       from "../internal/elements/assignment-property.js";
import Property                 from "../internal/elements/property.js";
import SpreadElement            from "../internal/elements/spread-element.js";
import TemplateElement          from "../internal/elements/template-element.js";
import ArrayExpression          from "../internal/expressions/array-expression.js";
import ArrowFunctionExpression  from "../internal/expressions/arrow-function-expression.js";
import AssignmentExpression     from "../internal/expressions/assignment-expression.js";
import BinaryExpression         from "../internal/expressions/binary-expression.js";
import CallExpression           from "../internal/expressions/call-expression.js";
import CoalesceExpression       from "../internal/expressions/coalesce-expression.js";
import ConditionalExpression    from "../internal/expressions/conditional-expression.js";
import Identifier               from "../internal/expressions/identifier.js";
import Literal                  from "../internal/expressions/literal.js";
import LogicalExpression        from "../internal/expressions/logical-expression.js";
import MemberExpression         from "../internal/expressions/member-expression.js";
import NewExpression            from "../internal/expressions/new-expression.js";
import ObjectExpression         from "../internal/expressions/object-expression.js";
import ParenthesizedExpression  from "../internal/expressions/parenthesized-expression.js";
import SequenceExpression       from "../internal/expressions/sequence-expression.js";
import TaggedTemplateExpression from "../internal/expressions/tagged-template-expression.js";
import TemplateLiteral          from "../internal/expressions/template-literal.js";
import ThisExpression           from "../internal/expressions/this-expression.js";
import UnaryExpression          from "../internal/expressions/unary-expression.js";
import UpdateExpression         from "../internal/expressions/update-expression.js";
import ArrayPattern             from "../internal/patterns/array-pattern.js";
import AssignmentPattern        from "../internal/patterns/assignment-pattern.js";
import ObjectPattern            from "../internal/patterns/object-pattern.js";
import RestElement              from "../internal/patterns/rest-element.js";

type ValidVisitSpec = { raw: string, value: string, context?: Object };

// eslint-disable-next-line import/prefer-default-export
export const validVisitors: ValidVisitSpec[] =
[
    {
        raw:   "[1]",
        value:
        [
            ArrayExpression.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "[, 1]",
        value:
        [
            ArrayExpression.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "([a]) => a",
        value:
        [
            ArrowFunctionExpression.name,
            ArrayPattern.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "([, a]) => a",
        value:
        [
            ArrowFunctionExpression.name,
            ArrayPattern.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "x = 1",
        value:
        [
            AssignmentExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "(x = 1) => x",
        value:
        [
            ArrowFunctionExpression.name,
            AssignmentPattern.name,
            Identifier.name,
            Literal.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "x + 1",
        value:
        [
            BinaryExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "x + 1",
        value:
        [
            BinaryExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "f(1)",
        value:
        [
            CallExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "x ?? y",
        value:
        [
            CoalesceExpression.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "x != null ? x : true",
        value:
        [
            ConditionalExpression.name,
            BinaryExpression.name,
            Identifier.name,
            Literal.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "x || false",
        value:
        [
            LogicalExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "x.y",
        value:
        [
            MemberExpression.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "new f(1)",
        value:
        [
            NewExpression.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "({ x: 1 })",
        value:
        [
            ParenthesizedExpression.name,
            ObjectExpression.name,
            Property.name,
            Identifier.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "({ x }) => x",
        value:
        [
            ArrowFunctionExpression.name,
            ObjectPattern.name,
            AssignmentProperty.name,
            Identifier.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "(...x) => x",
        value:
        [
            ArrowFunctionExpression.name,
            RestElement.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "(x, y)",
        value:
        [
            SequenceExpression.name,
            Identifier.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "f(...x)",
        value:
        [
            CallExpression.name,
            Identifier.name,
            SpreadElement.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "tag`Hello: ${'World'}!!!`",
        value:
        [
            TaggedTemplateExpression.name,
            Identifier.name,
            TemplateLiteral.name,
            TemplateElement.name,
            TemplateElement.name,
            Literal.name,
        ].join(" > "),
    },
    {
        raw:   "`Hello: ${ x }`",
        value:
        [
            TemplateLiteral.name,
            TemplateElement.name,
            TemplateElement.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "this",
        value:
        [
            ThisExpression.name,
        ].join(" > "),
    },
    {
        raw:   "x++",
        value:
        [
            UpdateExpression.name,
            Identifier.name,
        ].join(" > "),
    },
    {
        raw:   "!x",
        value:
        [
            UnaryExpression.name,
            Identifier.name,
        ].join(" > "),
    },
];