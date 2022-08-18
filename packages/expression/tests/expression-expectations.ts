/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-len */
import type { Indexer }         from "@surface/core";
import { format }               from "@surface/core";
import AssignmentProperty       from "../internal/elements/assignment-property.js";
import Property                 from "../internal/elements/property.js";
import SpreadElement            from "../internal/elements/spread-element.js";
import TemplateElement          from "../internal/elements/template-element.js";
import ArrayExpression          from "../internal/expressions/array-expression.js";
import ArrowFunctionExpression  from "../internal/expressions/arrow-function-expression.js";
import AssignmentExpression     from "../internal/expressions/assignment-expression.js";
import BinaryExpression         from "../internal/expressions/binary-expression.js";
import CallExpression           from "../internal/expressions/call-expression.js";
import ChainExpression          from "../internal/expressions/chain-expression.js";
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
import type INode               from "../internal/interfaces/node.js";
import Messages                 from "../internal/messages.js";
import NodeType                 from "../internal/node-type.js";
import ArrayPattern             from "../internal/patterns/array-pattern.js";
import AssignmentPattern        from "../internal/patterns/assignment-pattern.js";
import ObjectPattern            from "../internal/patterns/object-pattern.js";
import RestElement              from "../internal/patterns/rest-element.js";

export type ExpressionFactoryExpected = { method: string, toString: string, type: NodeType, factory: () => INode };
export type EvaluationErrorExpected   = { error: Error, raw: string, scope: Indexer };

export const expressionFactoriesExpected: ExpressionFactoryExpected[] =
[
    {
        factory:  (): INode => new ArrayExpression([new Literal(1), new Literal(2)]),
        method:   ArrayExpression.name,
        toString: "[1, 2]",
        type:     NodeType.ArrayExpression,
    },
    {
        factory:  (): INode => new ArrayPattern([new Identifier("x")]),
        method:   ArrayPattern.name,
        toString: "[x]",
        type:     NodeType.ArrayPattern,
    },
    {
        factory:  (): INode => new AssignmentExpression(new Identifier("x"), new Literal(1), "="),
        method:   AssignmentExpression.name,
        toString: "x = 1",
        type:     NodeType.AssignmentExpression,
    },
    {
        factory:  (): INode => new AssignmentPattern(new Identifier("x"), new Literal(1)),
        method:   AssignmentPattern.name,
        toString: "x = 1",
        type:     NodeType.AssignmentPattern,
    },
    {
        factory:  (): INode => new ArrowFunctionExpression([new Identifier("x")], new Identifier("x")),
        method:   ArrowFunctionExpression.name,
        toString: "(x) => x",
        type:     NodeType.ArrowFunctionExpression,
    },
    {
        factory:  (): INode => new BinaryExpression(new Literal(1), new Literal(2), ">"),
        method:   BinaryExpression.name,
        toString: "1 > 2",
        type:     NodeType.BinaryExpression,
    },
    {
        factory:  (): INode => new CallExpression(new ArrowFunctionExpression([new Identifier("x")], new Identifier("x"))),
        method:   CallExpression.name,
        toString: "((x) => x)()",
        type:     NodeType.CallExpression,
    },
    {
        factory:  (): INode => new CallExpression(new ArrowFunctionExpression([new Identifier("x")], new Identifier("x")), [new Literal(2)]),
        method:   CallExpression.name,
        toString: "((x) => x)(2)",
        type:     NodeType.CallExpression,
    },
    {
        factory:  (): INode => new ChainExpression(new MemberExpression(new ThisExpression(), new Identifier("value"), false, true)),
        method:   ChainExpression.name,
        toString: "this?.value",
        type:     NodeType.ChainExpression,
    },
    {
        factory:  (): INode => new ConditionalExpression(new Literal(true), new Literal(1), new Literal(2)),
        method:   ConditionalExpression.name,
        toString: "true ? 1 : 2",
        type:     NodeType.ConditionalExpression,
    },
    {
        factory:  (): INode => new Literal(1),
        method:   Literal.name,
        toString: "1",
        type:     NodeType.Literal,
    },
    {
        factory:  (): INode => new LogicalExpression(new Identifier("x"), new Identifier("y"), "&&"),
        method:   LogicalExpression.name,
        toString: "x && y",
        type:     NodeType.LogicalExpression,
    },
    {
        factory:  (): INode => new Identifier("undefined"),
        method:   Identifier.name,
        toString: "undefined",
        type:     NodeType.Identifier,
    },
    {
        factory:  (): INode => new MemberExpression(new ThisExpression(), new Identifier("value"), false, false),
        method:   MemberExpression.name,
        toString: "this.value",
        type:     NodeType.MemberExpression,
    },
    {
        factory:  (): INode => new NewExpression(new Identifier("Foo")),
        method:   NewExpression.name,
        toString: "new Foo()",
        type:     NodeType.NewExpression,
    },
    {
        factory:  (): INode => new NewExpression(new Identifier("Foo"), [new Literal(1)]),
        method:   NewExpression.name,
        toString: "new Foo(1)",
        type:     NodeType.NewExpression,
    },
    {
        factory:  (): INode => new ObjectExpression(),
        method:   ObjectExpression.name,
        toString: "{ }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  (): INode => new ObjectExpression([new Property(new Identifier("value"), new Identifier("value"), false, true)]),
        method:   ObjectExpression.name,
        toString: "{ value }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  (): INode => new ObjectExpression([new Property(new Identifier("value"), new Literal(1), false)]),
        method:   ObjectExpression.name,
        toString: "{ value: 1 }",
        type:     NodeType.ObjectExpression,
    },
    {
        factory:  (): INode => new ObjectPattern([new AssignmentProperty(new Identifier("value"), new Identifier("value"), false, true)]),
        method:   ObjectPattern.name,
        toString: "{ value }",
        type:     NodeType.ObjectPattern,
    },
    {
        factory:  (): INode => new ObjectPattern([new AssignmentProperty(new Identifier("x"), new Identifier("y"), false)]),
        method:   ObjectPattern.name,
        toString: "{ x: y }",
        type:     NodeType.ObjectPattern,
    },
    {
        factory:  (): INode => new ParenthesizedExpression(new Identifier("x")),
        method:   ParenthesizedExpression.name,
        toString: "(x)",
        type:     NodeType.ParenthesizedExpression,
    },
    {
        factory:  (): INode => new RestElement(new Identifier("x")),
        method:   RestElement.name,
        toString: "...x",
        type:     NodeType.RestElement,
    },
    {
        factory:  (): INode => new SpreadElement(new Identifier("x")),
        method:   SpreadElement.name,
        toString: "...x",
        type:     NodeType.SpreadElement,
    },
    {
        factory:  (): INode => new SequenceExpression([new Identifier("x"), new Identifier("y")]),
        method:   SequenceExpression.name,
        toString: "(x, y)",
        type:     NodeType.SequenceExpression,
    },
    {
        factory:  (): INode => new TaggedTemplateExpression(new Identifier("tag"), new TemplateLiteral([new TemplateElement("Hello ", "Hello ", false), new TemplateElement("!!!", "!!!", true)], [new Literal("World")])),
        method:   TaggedTemplateExpression.name,
        toString: "tag`Hello ${\"World\"}!!!`",
        type:     NodeType.TaggedTemplateExpression,
    },
    {
        factory:  (): INode => new TemplateLiteral([new TemplateElement("Hello ", "Hello ", false), new TemplateElement("!!!", "!!!", true)], [new Literal("World")]),
        method:   TemplateLiteral.name,
        toString: "`Hello ${\"World\"}!!!`",
        type:     NodeType.TemplateLiteral,
    },
    {
        factory:  (): INode => new UnaryExpression(new Literal(true), "!"),
        method:   UnaryExpression.name,
        toString: "!true",
        type:     NodeType.UnaryExpression,
    },
    {
        factory:  (): INode => new UpdateExpression(new Identifier("x"), "++", true),
        method:   UpdateExpression.name,
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