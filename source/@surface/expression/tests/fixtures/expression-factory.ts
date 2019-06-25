import Expression     from "../..";
import ExpressionType from "../../expression-type";
import IExpression    from "../../interfaces/expression";

export type ExpressionFactoryFixture = { factory: () => IExpression, type: ExpressionType, value: unknown };

export const expressionFactoryFixtures: Array<ExpressionFactoryFixture> =
[
    {
        factory: () => Expression.array([Expression.constant(1), Expression.constant(2)]),
        type:    ExpressionType.Array,
        value:   [1, 2]
    },
    {
        factory: () => Expression.binary(Expression.constant(1), Expression.constant(2), ">"),
        type:    ExpressionType.Binary,
        value:   false
    },
    {
        factory: () => Expression.call(Expression.constant(null), Expression.constant((value: number) => ++value), [Expression.constant(1)]),
        type:    ExpressionType.Call,
        value:   2
    },
    {
        factory: () => Expression.conditional(Expression.constant(true), Expression.constant(1), Expression.constant(2)),
        type:    ExpressionType.Conditional,
        value:   1
    },
    {
        factory: () => Expression.constant(1),
        type:    ExpressionType.Constant,
        value:   1
    },
    {
        factory: () => Expression.identifier({ value: 1 }, "value"),
        type:    ExpressionType.Identifier,
        value:   1
    },
    {
        factory: () => Expression.member(Expression.constant({ value: 1 }), Expression.constant("value"), false),
        type:    ExpressionType.Member,
        value:   1
    },
    {
        factory: () => Expression.object([Expression.property(Expression.constant("value"), Expression.constant(1), false)]),
        type:    ExpressionType.Object,
        value:   { value: 1 }
    },
    {
        factory: () => Expression.property(Expression.constant("value"), Expression.constant(1), false),
        type:    ExpressionType.Property,
        value:   1
    },
    {
        factory: () => Expression.regex("/foo/", "i"),
        type:    ExpressionType.Regex,
        value:   /foo/i
    },
    {
        factory: () => Expression.template(["Hello ", "!!!"], [Expression.constant("World")]),
        type:    ExpressionType.Template,
        value:   "Hello World!!!"
    },
    {
        factory: () => Expression.unary(Expression.constant(true), "!"),
        type:    ExpressionType.Unary,
        value:   false
    },
];