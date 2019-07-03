import Expression  from "../..";
import IExpression from "../../interfaces/expression";
import NodeType    from "../../node-type";

export type ExpressionFactoryFixture = { factory: () => IExpression, type: NodeType, value: unknown };

export const expressionFactoryFixtures: Array<ExpressionFactoryFixture> =
[
    {
        factory: () => Expression.array([Expression.constant(1), Expression.constant(2)]),
        type:    NodeType.Array,
        value:   [1, 2]
    },
    {
        factory: () => Expression.binary(Expression.constant(1), Expression.constant(2), ">"),
        type:    NodeType.Binary,
        value:   false
    },
    {
        factory: () => Expression.call(Expression.constant(null), Expression.constant((value: number) => ++value), [Expression.constant(1)]),
        type:    NodeType.Call,
        value:   2
    },
    {
        factory: () => Expression.conditional(Expression.constant(true), Expression.constant(1), Expression.constant(2)),
        type:    NodeType.Conditional,
        value:   1
    },
    {
        factory: () => Expression.constant(1),
        type:    NodeType.Constant,
        value:   1
    },
    {
        factory: () => Expression.identifier({ value: 1 }, "value"),
        type:    NodeType.Identifier,
        value:   1
    },
    {
        factory: () => Expression.member(Expression.constant({ value: 1 }), Expression.constant("value"), false),
        type:    NodeType.Member,
        value:   1
    },
    {
        factory: () => Expression.object([Expression.property(Expression.constant("value"), Expression.constant(1), false)]),
        type:    NodeType.Object,
        value:   { value: 1 }
    },
    {
        factory: () => Expression.regex("/foo/", "i"),
        type:    NodeType.Regex,
        value:   /foo/i
    },
    {
        factory: () => Expression.template(["Hello ", "!!!"], [Expression.constant("World")]),
        type:    NodeType.Template,
        value:   "Hello World!!!"
    },
    {
        factory: () => Expression.unary(Expression.constant(true), "!"),
        type:    NodeType.Unary,
        value:   false
    },
];