/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-len */
import type { Indexer } from "@surface/core";
import { format }       from "@surface/core";
import Expression       from "../internal/expression.js";
import type INode       from "../internal/interfaces/node";
import Messages         from "../internal/messages.js";
import NodeType         from "../internal/node-type.js";

export type ExpressionFactoryExpected = { method: string, toString: string, type: NodeType, factory: () => INode };
export type EvaluationErrorExpected   = { error: Error, raw: string, scope: Indexer };

export const expressionFactoriesExpected: ExpressionFactoryExpected[] =
[
    {
        factory:  (): INode => Expression.array([Expression.literal(1), Expression.literal(2)]),
        method:   Expression.array.name,
        toString: "[1, 2]",
        type:     NodeType.ArrayExpression,
    },
    {
        factory:  (): INode => Expression.arrayPattern([Expression.identifier("x")]),
        method:   Expression.arrayPattern.name,
        toString: "[x]",
        type:     NodeType.ArrayPattern,
    },
    {
        factory:  (): INode => Expression.assignment(Expression.identifier("x"), Expression.literal(1), "="),
        method:   Expression.assignment.name,
        toString: "x = 1",
        type:     NodeType.AssignmentExpression,
    },
    {
        factory:  (): INode => Expression.assignmentPattern(Expression.identifier("x"), Expression.literal(1)),
        method:   Expression.assignment.name,
        toString: "x = 1",
        type:     NodeType.AssignmentPattern,
    },
    {
        factory:  (): INode => Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x")),
        method:   Expression.arrowFunction.name,
        toString: "(x) => x",
        type:     NodeType.ArrowFunctionExpression,
    },
    {
        factory:  (): INode => Expression.binary(Expression.literal(1), Expression.literal(2), ">"),
        method:   Expression.arrowFunction.name,
        toString: "(1 > 2)",
        type:     NodeType.BinaryExpression,
    },
    {
        factory:  (): INode => Expression.call(Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x"))),
        method:   Expression.call.name,
        toString: "((x) => x)()",
        type:     NodeType.CallExpression,
    },
    {
        factory:  (): INode => Expression.call(Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x")), [Expression.literal(2)]),
        method:   Expression.call.name,
        toString: "((x) => x)(2)",
        type:     NodeType.CallExpression,
    },
    {
        factory:  (): INode => Expression.chainExpression(Expression.member(Expression.this(), Expression.identifier("value"), false, true)),
        method:   Expression.chainExpression.name,
        toString: "this?.value",
        type:     NodeType.ChainExpression,
    },
    {
        factory:  (): INode => Expression.conditional(Expression.literal(true), Expression.literal(1), Expression.literal(2)),
        method:   Expression.conditional.name,
        toString: "true ? 1 : 2",
        type:     NodeType.ConditionalExpression,
    },
    {
        factory:  (): INode => Expression.literal(1),
        method:   Expression.literal.name,
        toString: "1",
        type:     NodeType.Literal,
    },
    {
        factory:  (): INode => Expression.logical(Expression.identifier("x"), Expression.identifier("y"), "&&"),
        method:   Expression.logical.name,
        toString: "(x && y)",
        type:     NodeType.LogicalExpression,
    },
    {
        factory:  (): INode => Expression.identifier("undefined"),
        method:   Expression.identifier.name,
        toString: "undefined",
        type:     NodeType.Identifier,
    },
    {
        factory:  (): INode => Expression.member(Expression.this(), Expression.identifier("value"), false, false),
        method:   Expression.member.name,
        toString: "this.value",
        type:     NodeType.MemberExpression,
    },
    {
        factory:  (): INode => Expression.new(Expression.identifier("Foo")),
        method:   Expression.new.name,
        toString: "new Foo()",
        type:     NodeType.NewExpression,
    },
    {
        factory:  (): INode => Expression.new(Expression.identifier("Foo"), [Expression.literal(1)]),
        method:   Expression.new.name,
        toString: "new Foo(1)",
        type:     NodeType.NewExpression,
    },
    {
        factory:  (): INode => Expression.object(),
        method:   Expression.object.name,
        toString: "{ }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  (): INode => Expression.object([Expression.property(Expression.identifier("value"))]),
        method:   Expression.object.name,
        toString: "{ value }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  (): INode => Expression.object([Expression.property(Expression.identifier("value"), Expression.literal(1), false)]),
        method:   Expression.object.name,
        toString: "{ value: 1 }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  (): INode => Expression.objectPattern([Expression.assignmentProperty(Expression.identifier("value"))]),
        method:   Expression.objectPattern.name,
        toString: "{ value }",
        type:     NodeType.ObjectPattern,
    },
    {
        factory:  (): INode => Expression.objectPattern([Expression.assignmentProperty(Expression.identifier("x"), Expression.identifier("y"), false)]),
        method:   Expression.objectPattern.name,
        toString: "{ x: y }",
        type:     NodeType.ObjectPattern,
    },
    {
        factory:  (): INode => Expression.parenthesized(Expression.identifier("x")),
        method:   Expression.parenthesized.name,
        toString: "(x)",
        type:     NodeType.ParenthesizedExpression,
    },
    {
        factory:  (): INode => Expression.regex("foo", "i"),
        method:   Expression.regex.name,
        toString: "/foo/i",
        type:     NodeType.RegExpLiteral,
    },
    {
        factory:  (): INode => Expression.rest(Expression.identifier("x")),
        method:   Expression.rest.name,
        toString: "...x",
        type:     NodeType.RestElement,
    },
    {
        factory:  (): INode => Expression.spread(Expression.identifier("x")),
        method:   Expression.spread.name,
        toString: "...x",
        type:     NodeType.SpreadElement,
    },
    {
        factory:  (): INode => Expression.sequence([Expression.identifier("x"), Expression.identifier("y")]),
        method:   Expression.sequence.name,
        toString: "(x, y)",
        type:     NodeType.SequenceExpression,
    },
    {
        factory:  (): INode => Expression.taggedTemplate(Expression.identifier("tag"), Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")])),
        method:   Expression.taggedTemplate.name,
        toString: "tag`Hello ${\"World\"}!!!`",
        type:     NodeType.TaggedTemplateExpression,
    },
    {
        factory:  (): INode => Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")]),
        method:   Expression.template.name,
        toString: "`Hello ${\"World\"}!!!`",
        type:     NodeType.TemplateLiteral,
    },
    {
        factory:  (): INode => Expression.unary(Expression.literal(true), "!"),
        method:   Expression.unary.name,
        toString: "!true",
        type:     NodeType.UnaryExpression,
    },
    {
        factory:  (): INode => Expression.update(Expression.identifier("x"), "++", true),
        method:   Expression.update.name,
        toString: "++x",
        type:     NodeType.UpdateExpression,
    },
];

export const evaluationsExpected: EvaluationErrorExpected[] =
[
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "x" })),
        raw:   "x",
        scope: { },
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "this.fn" })),
        raw:   "this.fn()",
        scope: { this: { } },
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotAFunction, { identifier: "fn" })),
        raw:   "fn()",
        scope: { fn: 1 },
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "this.tag" })),
        raw:   "this.tag`Hello ${'World'}`",
        scope: { this: { } },
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotAFunction, { identifier: "tag" })),
        raw:   "tag`Hello ${'World'}`",
        scope: { tag: 1 },
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotDefined, { identifier: "this.fn" })),
        raw:   "new this.fn()",
        scope: { this: { } },
    },
    {
        error: new ReferenceError(format(Messages.identifierIsNotAConstructor, { identifier: "fn" })),
        raw:   "new fn()",
        scope: { fn: 1 },
    },
];