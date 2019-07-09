import { Indexer } from "@surface/core";
import Expression  from "../..";
import IExpression from "../../interfaces/expression";
import NodeType    from "../../node-type";

export type ExpressionFactoryFixture = { factory: () => IExpression, type: NodeType, value: unknown, scope?: Indexer };

export const expressionFactoryFixtures: Array<ExpressionFactoryFixture> =
[
    {
        factory: () => Expression.array([Expression.literal(1), Expression.literal(2)]),
        type:    NodeType.ArrayExpression,
        value:   [1, 2]
    },
    {
        factory: () => Expression.binary(Expression.literal(1), Expression.literal(2), ">"),
        type:    NodeType.BinaryExpression,
        value:   false
    },
    {
        factory: () => Expression.call(Expression.this(), Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x", true)), [Expression.literal(2)]),
        type:    NodeType.CallExpression,
        value:   2
    },
    {
        factory: () => Expression.conditional(Expression.literal(true), Expression.literal(1), Expression.literal(2)),
        type:    NodeType.ConditionalExpression,
        value:   1
    },
    {
        factory: () => Expression.literal(1),
        type:    NodeType.Literal,
        value:   1
    },
    {
        factory: () => Expression.identifier("value", true),
        type:    NodeType.Identifier,
        value:   undefined
    },
    {
        factory: () => Expression.member(Expression.object([Expression.property(Expression.literal("value"), Expression.literal(1))]), Expression.literal("value"), false),
        type:    NodeType.MemberExpression,
        value:   1
    },
    {
        factory: () => Expression.object([Expression.property(Expression.literal("value"), Expression.literal(1), false)]),
        type:    NodeType.ObjectExpression,
        value:   { value: 1 }
    },
    {
        factory: () => Expression.regex("/foo/", "i"),
        type:    NodeType.RegExpLiteral,
        value:   /foo/i
    },
    {
        factory: () => Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")]),
        type:    NodeType.TemplateLiteral,
        value:   "Hello World!!!"
    },
    {
        factory: () => Expression.unary(Expression.literal(true), "!"),
        type:    NodeType.UnaryExpression,
        value:   false
    },
];