import { Indexer } from "@surface/core";
import { format }  from "@surface/core/common/string";
import Expression  from "../..";
import INode       from "../../interfaces/node";
import Messages    from "../../internal/messages";
import NodeType    from "../../node-type";

export type ExpressionFactoryExpected = { method: string, type: NodeType, factory: () => INode };
export type EvaluationErrorExpected   = { error: Error, raw: string, scope: Indexer };

export const expressionFactoriesExpected: Array<ExpressionFactoryExpected> =
[
    {
        factory: () => Expression.array([Expression.literal(1), Expression.literal(2)]),
        method:  Expression.array.name,
        type:    NodeType.ArrayExpression,
    },
    {
        factory: () => Expression.arrayPattern([Expression.identifier("x")]),
        method:  Expression.arrayPattern.name,
        type:    NodeType.ArrayPattern,
    },
    {
        factory: () => Expression.assignment(Expression.identifier("x"), Expression.literal(1), "="),
        method:  Expression.assignment.name,
        type:    NodeType.AssignmentExpression,
    },
    {
        factory: () => Expression.assignmentPattern(Expression.identifier("x"), Expression.literal(1)),
        method:  Expression.assignment.name,
        type:    NodeType.AssignmentPattern,
    },
    {
        factory: () => Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x")),
        method:  Expression.arrowFunction.name,
        type:    NodeType.ArrowFunctionExpression,
    },
    {
        factory: () => Expression.binary(Expression.literal(1), Expression.literal(2), ">"),
        method:  Expression.arrowFunction.name,
        type:    NodeType.BinaryExpression,
    },
    {
        factory: () => Expression.call(Expression.this(), Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x"))),
        method:  Expression.call.name,
        type:    NodeType.CallExpression,
    },
    {
        factory: () => Expression.call(Expression.this(), Expression.arrowFunction([Expression.identifier("x")], Expression.identifier("x")), [Expression.literal(2)]),
        method:  Expression.call.name,
        type:    NodeType.CallExpression,
    },
    {
        factory: () => Expression.conditional(Expression.literal(true), Expression.literal(1), Expression.literal(2)),
        method:  Expression.conditional.name,
        type:    NodeType.ConditionalExpression,
    },
    {
        factory: () => Expression.literal(1),
        method:  Expression.literal.name,
        type:    NodeType.Literal,
    },
    {
        factory: () => Expression.logical(Expression.identifier("x"), Expression.identifier("y"), "&&"),
        method:  Expression.logical.name,
        type:    NodeType.LogicalExpression,
    },
    {
        factory: () => Expression.identifier("undefined"),
        method:  Expression.identifier.name,
        type:    NodeType.Identifier,
    },
    {
        factory: () => Expression.member(Expression.object([Expression.property(Expression.literal("value"), Expression.literal(1))]), Expression.literal("value"), false),
        method:  Expression.member.name,
        type:    NodeType.MemberExpression,
    },
    {
        factory: () => Expression.new(Expression.identifier("x")),
        method:  Expression.new.name,
        type:    NodeType.NewExpression,
    },
    {
        factory: () => Expression.new(Expression.identifier("x"), [Expression.literal(1)]),
        method:  Expression.new.name,
        type:    NodeType.NewExpression,
    },
    {
        factory: () => Expression.object(),
        method:  Expression.object.name,
        type:    NodeType.ObjectExpression,
    },
    {
        factory: () => Expression.object([Expression.property(Expression.identifier("value"))]),
        method:  Expression.object.name,
        type:    NodeType.ObjectExpression,
    },
    {
        factory: () => Expression.object([Expression.property(Expression.identifier("value"), Expression.literal(1), false)]),
        method:  Expression.object.name,
        type:    NodeType.ObjectExpression,
    },
    {
        factory: () => Expression.objectPattern([Expression.assignmentProperty(Expression.identifier("value"))]),
        method:  Expression.objectPattern.name,
        type:    NodeType.ObjectPattern,
    },
    {
        factory: () => Expression.objectPattern([Expression.assignmentProperty(Expression.identifier("x"), Expression.identifier("y"), false)]),
        method:  Expression.objectPattern.name,
        type:    NodeType.ObjectPattern,
    },
    {
        factory: () => Expression.regex("/foo/", "i"),
        method:  Expression.regex.name,
        type:    NodeType.RegExpLiteral,
    },
    {
        factory: () => Expression.rest(Expression.identifier("x")),
        method:  Expression.rest.name,
        type:    NodeType.RestElement,
    },
    {
        factory: () => Expression.spread(Expression.identifier("x")),
        method:  Expression.spread.name,
        type:    NodeType.SpreadElement,
    },
    {
        factory: () => Expression.sequence([Expression.identifier("x"), Expression.identifier("y")]),
        method:  Expression.sequence.name,
        type:    NodeType.SequenceExpression,
    },
    {
        factory: () => Expression.taggedTemplate(Expression.literal(null), Expression.identifier("tag"), Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")])),
        method:  Expression.taggedTemplate.name,
        type:    NodeType.TaggedTemplateExpression,
    },
    {
        factory: () => Expression.template([Expression.templateElement("Hello ", "Hello ", false), Expression.templateElement("!!!", "!!!", true)], [Expression.literal("World")]),
        method:  Expression.template.name,
        type:    NodeType.TemplateLiteral,
    },
    {
        factory: () => Expression.unary(Expression.literal(true), "!"),
        method:  Expression.unary.name,
        type:    NodeType.UnaryExpression,
    },
    {
        factory: () => Expression.update(Expression.identifier("x"), "++", true),
        method:  Expression.update.name,
        type:    NodeType.UpdateExpression,
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