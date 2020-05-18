import { Indexer, format } from "@surface/core";
import Expression          from "../..";
import INode               from "../../internal/interfaces/node";
import Messages            from "../../internal/messages";
import NodeType            from "../../internal/node-type";

export type ExpressionFactoryExpected = { method: string, toString: string, type: NodeType, factory: () => INode };
export type EvaluationErrorExpected   = { error: Error, raw: string, scope: Indexer };

export const expressionFactoriesExpected: Array<ExpressionFactoryExpected> =
[
    {
        factory:  () => Expression.array([Expression.literal(1), Expression.literal(2)]),
        method:   Expression.array.name,
        toString: "[1, 2]",
        type:     NodeType.ArrayExpression,
    },
    {
        factory:  () => Expression.arrayPattern([Expression.identifier("x")]),
        method:   Expression.arrayPattern.name,
        toString: "[x]",
        type:     NodeType.ArrayPattern,
    },
    {
        factory:  () => Expression.assignment(Expression.identifier("x"), Expression.literal(1), "="),
        method:   Expression.assignment.name,
        toString: "x = 1",
        type:     NodeType.AssignmentExpression,
    },
    {
        factory:  () => Expression.assignmentPattern(Expression.identifier("x"), Expression.literal(1)),
        method:   Expression.assignment.name,
        toString: "x = 1",
        type:     NodeType.AssignmentPattern,
    },
    {
        factory:  () => Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x")),
        method:   Expression.arrowFunction.name,
        toString: "(x) => x",
        type:     NodeType.ArrowFunctionExpression,
    },
    {
        factory:  () => Expression.binary(Expression.literal(1), Expression.literal(2), ">"),
        method:   Expression.arrowFunction.name,
        toString: "(1 > 2)",
        type:     NodeType.BinaryExpression,
    },
    {
        factory:  () => Expression.call(Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x"))),
        method:   Expression.call.name,
        toString: "((x) => x)()",
        type:     NodeType.CallExpression,
    },
    {
        factory:  () => Expression.call(Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x")), [Expression.literal(2)]),
        method:   Expression.call.name,
        toString: "((x) => x)(2)",
        type:     NodeType.CallExpression,
    },
    {
        factory:  () => Expression.coalesce(Expression.literal(null), Expression.literal(0)),
        method:   Expression.coalesce.name,
        toString: "(null ?? 0)",
        type:     NodeType.CoalesceExpression,
    },
    {
        factory:  () => Expression.conditional(Expression.literal(true), Expression.literal(1), Expression.literal(2)),
        method:   Expression.conditional.name,
        toString: "true ? 1 : 2",
        type:     NodeType.ConditionalExpression,
    },
    {
        factory:  () => Expression.literal(1),
        method:   Expression.literal.name,
        toString: "1",
        type:     NodeType.Literal,
    },
    {
        factory:  () => Expression.logical(Expression.identifier("x"), Expression.identifier("y"), "&&"),
        method:   Expression.logical.name,
        toString: "(x && y)",
        type:     NodeType.LogicalExpression,
    },
    {
        factory:  () => Expression.identifier("undefined"),
        method:   Expression.identifier.name,
        toString: "undefined",
        type:     NodeType.Identifier,
    },
    {
        factory:  () => Expression.member(Expression.this(), Expression.identifier("value"), false),
        toString: "this.value",
        method:   Expression.member.name,
        type:     NodeType.MemberExpression,
    },
    {
        factory:  () => Expression.new(Expression.identifier("Foo")),
        method:   Expression.new.name,
        toString: "new Foo()",
        type:     NodeType.NewExpression,
    },
    {
        factory:  () => Expression.new(Expression.identifier("Foo"), [Expression.literal(1)]),
        method:   Expression.new.name,
        toString: "new Foo(1)",
        type:     NodeType.NewExpression,
    },
    {
        factory:  () => Expression.object(),
        method:   Expression.object.name,
        toString: "{ }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  () => Expression.object([Expression.property(Expression.identifier("value"))]),
        method:   Expression.object.name,
        toString: "{ value }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  () => Expression.object([Expression.property(Expression.identifier("value"), Expression.literal(1), false)]),
        method:   Expression.object.name,
        toString: "{ value: 1 }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  () => Expression.objectPattern([Expression.assignmentProperty(Expression.identifier("value"))]),
        method:   Expression.objectPattern.name,
        toString: "{ value }",
        type:     NodeType.ObjectPattern,
    },
    {
        factory:  () => Expression.objectPattern([Expression.assignmentProperty(Expression.identifier("x"), Expression.identifier("y"), false)]),
        method:   Expression.objectPattern.name,
        toString: "{ x: y }",
        type:     NodeType.ObjectPattern,
    },
    {
        factory:  () => Expression.parenthesized(Expression.identifier("x")),
        method:   Expression.parenthesized.name,
        toString: "(x)",
        type:     NodeType.ParenthesizedExpression,
    },
    {
        factory:  () => Expression.regex("foo", "i"),
        method:   Expression.regex.name,
        toString: "/foo/i",
        type:     NodeType.RegExpLiteral,
    },
    {
        factory:  () => Expression.rest(Expression.identifier("x")),
        method:   Expression.rest.name,
        toString: "...x",
        type:     NodeType.RestElement,
    },
    {
        factory:  () => Expression.spread(Expression.identifier("x")),
        method:   Expression.spread.name,
        toString: "...x",
        type:     NodeType.SpreadElement,
    },
    {
        factory:  () => Expression.sequence([Expression.identifier("x"), Expression.identifier("y")]),
        method:   Expression.sequence.name,
        toString: "(x, y)",
        type:     NodeType.SequenceExpression,
    },
    {
        factory:  () => Expression.taggedTemplate(Expression.identifier("tag"), Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")])),
        method:   Expression.taggedTemplate.name,
        toString: "tag`Hello ${\"World\"}!!!`",
        type:     NodeType.TaggedTemplateExpression,
    },
    {
        factory:  () => Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")]),
        method:   Expression.template.name,
        toString: "`Hello ${\"World\"}!!!`",
        type:     NodeType.TemplateLiteral,
    },
    {
        factory:  () => Expression.unary(Expression.literal(true), "!"),
        method:   Expression.unary.name,
        toString: "!true",
        type:     NodeType.UnaryExpression,
    },
    {
        factory:  () => Expression.update(Expression.identifier("x"), "++", true),
        method:   Expression.update.name,
        toString: "++x",
        type:     NodeType.UpdateExpression,
    },
];

export const evaluationsExpected: Array<EvaluationErrorExpected> =
[
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "x" })),
        raw:   "x",
        scope: { }
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "this.fn" })),
        raw:   "this.fn()",
        scope: { this: { }}
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotAFunction, { identifier: "fn" })),
        raw:   "fn()",
        scope: { fn: 1 }
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "this.tag" })),
        raw:   "this.tag`Hello ${'World'}`",
        scope: { this: { }}
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotAFunction, { identifier: "tag" })),
        raw:   "tag`Hello ${'World'}`",
        scope: { tag: 1 }
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "this.fn" })),
        raw:   "new this.fn()",
        scope: { this: { }}
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotAConstructor, { identifier: "fn" })),
        raw:   "new fn()",
        scope: { fn: 1 }
    },
];