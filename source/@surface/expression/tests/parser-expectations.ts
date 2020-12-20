/* eslint-disable no-template-curly-in-string */
/* eslint-disable max-lines */
import type { Constructor, Indexer } from "@surface/core";
import { format }                    from "@surface/core";
import ArrayExpression               from "../internal/expressions/array-expression.js";
import ArrowFunctionExpression       from "../internal/expressions/arrow-function-expression.js";
import AssignmentExpression          from "../internal/expressions/assignment-expression.js";
import BinaryExpression              from "../internal/expressions/binary-expression.js";
import CallExpression                from "../internal/expressions/call-expression.js";
import ChainExpression               from "../internal/expressions/chain-expression.js";
import ConditionalExpression         from "../internal/expressions/conditional-expression.js";
import Identifier                    from "../internal/expressions/identifier.js";
import Literal                       from "../internal/expressions/literal.js";
import LogicalExpression             from "../internal/expressions/logical-expression.js";
import MemberExpression              from "../internal/expressions/member-expression.js";
import NewExpression                 from "../internal/expressions/new-expression.js";
import ObjectExpression              from "../internal/expressions/object-expression.js";
import SequenceExpression            from "../internal/expressions/sequence-expression.js";
import TaggedTemplateExpression      from "../internal/expressions/tagged-template-expression.js";
import TemplateLiteral               from "../internal/expressions/template-literal.js";
import ThisExpression                from "../internal/expressions/this-expression.js";
import UnaryExpression               from "../internal/expressions/unary-expression.js";
import UpdateExpression              from "../internal/expressions/update-expression.js";
import type IExpression              from "../internal/interfaces/expression";
import Messages                      from "../internal/messages.js";
import SyntaxError                   from "../internal/syntax-error.js";

const scope =
{
    MyClass: class MyClass
    {
        public id:     number;
        public active: boolean;

        public constructor(id?: number, active?: boolean)
        {
            this.id     = id ?? 0;
            this.active = !!active;
        }

        public getId(): number
        {
            return this.id;
        }
    },
    getScope(): unknown
    {
        return this;
    },
    noop(value: unknown): unknown
    {
        return value;
    },
    object:
    {
        getValue(): number
        {
            return 1;
        },
    },
    this:
    {
        getObject: (): object => ({ value: "Hello World!!!" }),
        getValue:  (): number => 42,
        greater:   (left: number, right: number): boolean => left > right,
        id:        1,
        // eslint-disable-next-line no-param-reassign
        increment: (value: number): number => ++value,
        lesser:    (left: number, right: number): boolean => left < right,
        new:       "new",
        value:     1,
        value1:    0,
    },
};

function makeTemplateObject(cooked: string[], raw: string[]): string[]
{
    Object.defineProperty(cooked, "raw", { value: raw });

    return cooked;
}

export type ParseExpectedSpec =
{
    scope:    Indexer,
    raw:      string,
    toString: string,
    type:     Constructor<IExpression>,
    value:    unknown,
};

export type InvalidParseExpectedSpec =
{
    error: Error,
    raw:   string,
};

export const validExpressions: ParseExpectedSpec[] =
[
    {
        raw:      "[]",
        scope,
        toString: "[]",
        type:     ArrayExpression,
        value:    [],
    },
    {
        raw:      "[, 1, 2, , 3, ,]",
        scope,
        toString: "[undefined, 1, 2, undefined, 3, undefined]",
        type:     ArrayExpression,
        value:    [undefined, 1, 2, undefined, 3, undefined],
    },
    {
        raw:      "[1, 'foo', true, { foo: 'bar' }]",
        scope,
        toString: "[1, \"foo\", true, { foo: \"bar\" }]",
        type:     ArrayExpression,
        value:    [1, "foo", true, { foo: "bar" }],
    },
    {
        raw:      "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",
        scope:    { one: 1, two: 2 },
        toString: "[1, \"foo\", true, ...[{ foo: one }, { bar: two }]]",
        type:     ArrayExpression,
        value:    [1, "foo", true, { foo: 1 }, { bar: 2 }],
    },
    {
        raw:      "[0, ...factory()]",
        scope:    { factory: (): number[] => [1, 2, 3] },
        toString: "[0, ...factory()]",
        type:     ArrayExpression,
        value:    [0, 1, 2, 3],
    },
    {
        raw:      "() => undefined",
        scope,
        toString: "() => undefined",
        type:     ArrowFunctionExpression,
        value:    (): unknown => undefined,
    },
    {
        raw:      "() => ({ x: 1 })",
        scope,
        toString: "() => ({ x: 1 })",
        type:     ArrowFunctionExpression,
        value:    (): unknown => ({ x: 1 }),
    },
    {
        raw:      "a => a++",
        scope,
        toString: "(a) => a++",
        type:     ArrowFunctionExpression,
        // eslint-disable-next-line no-param-reassign
        value:    (a: number): unknown => a++,
    },
    {
        raw:      "(a) => a++",
        scope,
        toString: "(a) => a++",
        type:     ArrowFunctionExpression,
        // eslint-disable-next-line no-param-reassign
        value:    (a: number): unknown => a++,
    },
    {
        raw:      "(a = 1) => a++",
        scope,
        toString: "(a = 1) => a++",
        type:     ArrowFunctionExpression,
        // eslint-disable-next-line no-param-reassign
        value:    (a = 1): unknown => a++,
    },
    {
        raw:      "(a, b) => a + b",
        scope,
        toString: "(a, b) => a + b",
        type:     ArrowFunctionExpression,
        value:    (a: number, b: number): unknown => a + b,
    },
    {
        raw:      "([a]) => a",
        scope,
        toString: "([a]) => a",
        type:     ArrowFunctionExpression,
        value:    ([a]: string[]): unknown => a,
    },
    {
        raw:      "([a], [b]) => [a, b]",
        scope,
        toString: "([a], [b]) => [a, b]",
        type:     ArrowFunctionExpression,
        value:    ([a]: string[], [b]: string[]): unknown => [a, b],
    },
    {
        raw:      "([, a]) => a",
        scope,
        toString: "([, a]) => a",
        type:     ArrowFunctionExpression,
        value:    ([, a]: string[]): unknown => a,
    },
    {
        raw:      "([a = 1]) => a",
        scope,
        toString: "([a = 1]) => a",
        type:     ArrowFunctionExpression,
        value:    ([a = 1]: number[]): unknown => a,
    },
    {
        raw:      "(a, [b, c]) => a + b + c",
        scope,
        toString: "(a, [b, c]) => a + b + c",
        type:     ArrowFunctionExpression,
        value:    (a: number, [b, c]: number[]): unknown => a + b + c,
    },
    {
        raw:      "(a, [b, [c]]) => a + b + c",
        scope,
        toString: "(a, [b, [c]]) => a + b + c",
        type:     ArrowFunctionExpression,
        value:    (a: number, [b, [c]]: [number, number[]]): unknown => a + b + c,
    },
    {
        raw:      "(...a) => a",
        scope,
        toString: "(...a) => a",
        type:     ArrowFunctionExpression,
        value:    (...a: number[]): unknown => a,
    },
    {
        raw:      "(a, ...b) => [a, ...b]",
        scope,
        toString: "(a, ...b) => [a, ...b]",
        type:     ArrowFunctionExpression,
        value:    (a: number, ...b: number[]): unknown => [a, ...b],
    },
    {
        raw:      "(...[a]) => a",
        scope,
        toString: "(...[a]) => a",
        type:     ArrowFunctionExpression,
        value:    (...[a]: number[]): unknown => a,
    },
    {
        raw:      "(...[, a]) => a",
        scope,
        toString: "(...[, a]) => a",
        type:     ArrowFunctionExpression,
        value:    (...[, a]: number[]): unknown => a,
    },
    {
        raw:      "(...[a, ...b]) => a + b[0]",
        scope,
        toString: "(...[a, ...b]) => a + b[0]",
        type:     ArrowFunctionExpression,
        value:    (...[a, ...b]: number[]): unknown => a + b[0],
    },
    {
        raw:      "(...[a, [b]]) => a + b",
        scope,
        toString: "(...[a, [b]]) => a + b",
        type:     ArrowFunctionExpression,
        value:    (...[a, [b]]: [number, number[]]): unknown => a + b,
    },
    {
        raw:      "(...[a, { b }]) => a + b",
        scope,
        toString: "(...[a, { b }]) => a + b",
        type:     ArrowFunctionExpression,
        value:    (...[a, { b }]: [number, { b: number }]): unknown => a + b,
    },
    {
        raw:      "(...[a, { b, ...c }]) => a + b + c.x + c.y + c.z",
        scope,
        toString: "(...[a, { b, ...c }]) => a + b + c.x + c.y + c.z",
        type:     ArrowFunctionExpression,
        value:    (...[a, { b, ...c }]: [number, { b: number, x: number, y: number, z: number }]): unknown => a + b + c.x + c.y + c.z,
    },
    {
        raw:      "({ a }) => a",
        scope,
        toString: "({ a }) => a",
        type:     ArrowFunctionExpression,
        value:    ({ a }: { a: string }): unknown => a,
    },
    {
        raw:      "({ \"a\": a }) => a",
        scope,
        toString: "({ \"a\": a }) => a",
        type:     ArrowFunctionExpression,
        // eslint-disable-next-line no-useless-rename
        value:    ({ "a": a }: { "a": string }): unknown => a,
    },
    {
        raw:      "({ 0: a }) => a",
        scope,
        toString: "({ 0: a }) => a",
        type:     ArrowFunctionExpression,
        value:    ({ 0: a }: { 0: string }): unknown => a,
    },
    {
        raw:      "({ [0]: a }) => a",
        scope,
        toString: "({ [0]: a }) => a",
        type:     ArrowFunctionExpression,
        // eslint-disable-next-line no-useless-computed-key
        value:    ({ [0]: a }: { [key: number]: string }): unknown => a,
    },
    {
        raw:      "({ [scope.this.id]: a }) => a",
        scope,
        toString: "({ [scope.this.id]: a }) => a",
        type:     ArrowFunctionExpression,
        value:    ({ [scope.this.id]: a }: { [key: number]: string }): unknown => a,
    },
    {
        raw:      "({ a = 1 }) => a",
        scope,
        toString: "({ a = 1 }) => a",
        type:     ArrowFunctionExpression,
        value:    ({ a = 1 }: { a: number }): unknown => a,
    },
    {
        raw:      "({ a: b }) => b",
        scope,
        toString: "({ a: b }) => b",
        type:     ArrowFunctionExpression,
        value:    ({ a: b }: { a: number }): unknown => b,
    },
    {
        raw:      "({ a: [x] }) => x",
        scope,
        toString: "({ a: [x] }) => x",
        type:     ArrowFunctionExpression,
        value:    ({ a: [x] }: { a: number[] }): unknown => x,
    },
    {
        raw:      "(...[{ a: [x] }]) => x",
        scope,
        toString: "(...[{ a: [x] }]) => x",
        type:     ArrowFunctionExpression,
        value:    (...[{ a: [x] }]: { a: number[] }[]): unknown => x,
    },
    {
        raw:      "(a, { b, x: { c } }) => a + b + c",
        scope,
        toString: "(a, { b, x: { c } }) => a + b + c",
        type:     ArrowFunctionExpression,
        value:    (a: number, { b, x: { c } }: { b: number, x: { c: number } }): unknown => a + b + c,
    },
    {
        raw:      "(a, { b, x: { ...c } }) => [a, b, c]",
        scope,
        toString: "(a, { b, x: { ...c } }) => [a, b, c]",
        type:     ArrowFunctionExpression,
        value:    (a: number, { b, x: { ...c } }: { b: number, x: { c: number } }): unknown => [a, b, c],
    },
    {
        raw:      "(...{ a }) => a",
        scope,
        toString: "(...{ a }) => a",
        type:     ArrowFunctionExpression,
        value:    (...{ a }: { a: number }): unknown => a,
    },
    {
        raw:      "(...{ a, x: { b } }) => a + b",
        scope,
        toString: "(...{ a, x: { b } }) => a + b",
        type:     ArrowFunctionExpression,
        value:    (...{ a, x: { b } }: { a: number, x: { b: number } }): unknown => a + b,
    },
    {
        raw:      "this.value = 0",
        scope,
        toString: "this.value = 0",
        type:     AssignmentExpression,
        value:    0,
    },
    {
        raw:      "this[key] = 0",
        scope:    { key: "value", this: { value: 1 } },
        toString: "this[key] = 0",
        type:     AssignmentExpression,
        value:    0,
    },
    {
        raw:      "this.value = this.value1 += 2",
        scope,
        toString: "this.value = this.value1 += 2",
        type:     AssignmentExpression,
        value:    2,
    },
    {
        raw:      "this.value *= 2",
        scope,
        toString: "this.value *= 2",
        type:     AssignmentExpression,
        value:    4,
    },
    {
        raw:      "this.value **= 2",
        scope,
        toString: "this.value **= 2",
        type:     AssignmentExpression,
        value:    16,
    },
    {
        raw:      "this.value /= 2",
        scope,
        toString: "this.value /= 2",
        type:     AssignmentExpression,
        value:    8,
    },
    {
        raw:      "this.value %= 2",
        scope,
        toString: "this.value %= 2",
        type:     AssignmentExpression,
        value:    0,
    },
    {
        raw:      "this.value += 2",
        scope,
        toString: "this.value += 2",
        type:     AssignmentExpression,
        value:    2,
    },
    {
        raw:      "this.value -= 1",
        scope,
        toString: "this.value -= 1",
        type:     AssignmentExpression,
        value:    1,
    },
    {
        raw:      "this.value <<= 2",
        scope,
        toString: "this.value <<= 2",
        type:     AssignmentExpression,
        value:    4,
    },
    {
        raw:      "this.value >>= 1",
        scope,
        toString: "this.value >>= 1",
        type:     AssignmentExpression,
        value:    2,
    },
    {
        raw:      "this.value >>>= 1",
        scope,
        toString: "this.value >>>= 1",
        type:     AssignmentExpression,
        value:    1,
    },
    {
        raw:      "this.value &= 1",
        scope,
        toString: "this.value &= 1",
        type:     AssignmentExpression,
        value:    1,
    },
    {
        raw:      "this.value ^= 1",
        scope,
        toString: "this.value ^= 1",
        type:     AssignmentExpression,
        value:    0,
    },
    {
        raw:      "this.value |= 1",
        scope,
        toString: "this.value |= 1",
        type:     AssignmentExpression,
        value:    1,
    },
    {
        raw:      "x = y++",
        scope:    { x: 1, y: 2 },
        toString: "x = y++",
        type:     AssignmentExpression,
        value:    2,
    },
    {
        raw:      "x = ++y",
        scope:    { x: 1, y: 2 },
        toString: "x = ++y",
        type:     AssignmentExpression,
        value:    3,
    },
    {
        raw:      "x += (x++, x + y)",
        scope:    { x: 1, y: 2 },
        toString: "x += (x++, x + y)",
        type:     AssignmentExpression,
        value:    6,
    },
    {
        raw:      "1 + 1",
        scope,
        toString: "1 + 1",
        type:     BinaryExpression,
        value:    2,
    },
    {
        raw:      "1 - 1",
        scope,
        toString: "1 - 1",
        type:     BinaryExpression,
        value:    0,
    },
    {
        raw:      "2 * 2",
        scope,
        toString: "2 * 2",
        type:     BinaryExpression,
        value:    4,
    },
    {
        raw:      "4 / 2",
        scope,
        toString: "4 / 2",
        type:     BinaryExpression,
        value:    2,
    },
    {
        raw:      "10 % 3",
        scope,
        toString: "10 % 3",
        type:     BinaryExpression,
        value:    1,
    },
    {
        raw:      "'id' in this",
        scope:    { this: { id: 1 } },
        toString: "\"id\" in this",
        type:     BinaryExpression,
        value:    true,
    },
    {
        raw:      "1 == 1",
        scope,
        toString: "1 == 1",
        type:     BinaryExpression,
        value:    true,
    },
    {
        raw:      "1 === 1",
        scope,
        toString: "1 === 1",
        type:     BinaryExpression,
        value:    true,
    },
    {
        raw:      "1 != 1",
        scope,
        toString: "1 != 1",
        type:     BinaryExpression,
        value:    false,
    },
    {
        raw:      "1 !== 1",
        scope,
        toString: "1 !== 1",
        type:     BinaryExpression,
        value:    false,
    },
    {
        raw:      "({ } instanceof { }.constructor)",
        scope,
        toString: "{ } instanceof { }.constructor",
        type:     BinaryExpression,
        value:    true,
    },
    {
        raw:      "1 <= 0",
        scope,
        toString: "1 <= 0",
        type:     BinaryExpression,
        value:    false,
    },
    {
        raw:      "1 >= 0",
        scope,
        toString: "1 >= 0",
        type:     BinaryExpression,
        value:    true,
    },
    {
        raw:      "1 > 0",
        scope,
        toString: "1 > 0",
        type:     BinaryExpression,
        value:    true,
    },
    {
        raw:      "1 < 0",
        scope,
        toString: "1 < 0",
        type:     BinaryExpression,
        value:    false,
    },
    {
        raw:      "1 & 2",
        scope,
        toString: "1 & 2",
        type:     BinaryExpression,
        value:    0,
    },
    {
        raw:      "1 | 2",
        scope,
        toString: "1 | 2",
        type:     BinaryExpression,
        value:    3,
    },
    {
        raw:      "1 ^ 2",
        scope,
        toString: "1 ^ 2",
        type:     BinaryExpression,
        value:    3,
    },
    {
        raw:      "2 ** 2",
        scope,
        toString: "2 ** 2",
        type:     BinaryExpression,
        value:    4,
    },
    {
        raw:      "0b1000 << 2",
        scope,
        toString: "8 << 2",
        type:     BinaryExpression,
        value:    0b100000,
    },
    {
        raw:      "0b1000 >> 2",
        scope,
        toString: "8 >> 2",
        type:     BinaryExpression,
        value:    0b10,
    },
    {
        raw:      "0b1000 >>> 2",
        scope,
        toString: "8 >>> 2",
        type:     BinaryExpression,
        value:    0b10,
    },
    {
        raw:      "1 + 1 * 2 / 2",
        scope,
        toString: "1 + 1 * 2 / 2",
        type:     BinaryExpression,
        value:    2,
    },
    {
        raw:      "noop(true)",
        scope,
        toString: "noop(true)",
        type:     CallExpression,
        value:    true,
    },
    {
        raw:      "fn?.()",
        scope:    { fn: (): unknown => true },
        toString: "fn?.()",
        type:     ChainExpression,
        value:    true,
    },
    {
        raw:      "fn?.()",
        scope:    { fn: null },
        toString: "fn?.()",
        type:     ChainExpression,
        value:    undefined,
    },
    {
        raw:      "getScope()",
        scope,
        toString: "getScope()",
        type:     CallExpression,
        value:    null,
    },
    {
        raw:      "this.getValue()",
        scope,
        toString: "this.getValue()",
        type:     CallExpression,
        value:    42,
    },
    {
        raw:      "this.increment(1)",
        scope,
        toString: "this.increment(1)",
        type:     CallExpression,
        value:    2,
    },
    {
        raw:      "this.greater(1, 2)",
        scope,
        toString: "this.greater(1, 2)",
        type:     CallExpression,
        value:    false,
    },
    {
        raw:      "this.greater(...[1, 2],)",
        scope,
        toString: "this.greater(...[1, 2])",
        type:     CallExpression,
        value:    false,
    },
    {
        raw:      "object.getValue()",
        scope,
        toString: "object.getValue()",
        type:     CallExpression,
        value:    1,
    },
    {
        raw:      "/test/.test(\"test\")",
        scope,
        toString: "/test/.test(\"test\")",
        type:     CallExpression,
        value:    true,
    },
    {
        raw:      "/test/i.test(\"TEST\")",
        scope,
        toString: "/test/i.test(\"TEST\")",
        type:     CallExpression,
        value:    true,
    },
    {
        raw:      "(true ? this.greater : this.lesser)(1, 2)",
        scope,
        toString: "(true ? this.greater : this.lesser)(1, 2)",
        type:     CallExpression,
        value:    false,
    },
    {
        raw:      "greater(...factory())",
        scope:    { factory: (): unknown => [1, 2], greater: (a: number, b: number): unknown => a == 1 && b == 2 },
        toString: "greater(...factory())",
        type:     CallExpression,
        value:    true,
    },
    {
        raw:      "new MyClass(...factory()).getId()",
        scope:    { ...scope, factory: (): unknown => [2, true] },
        toString: "new MyClass(...factory()).getId()",
        type:     CallExpression,
        value:    2,
    },
    {
        raw:      "(() => 1)()",
        scope:    { },
        toString: "(() => 1)()",
        type:     CallExpression,
        value:    1,
    },
    {
        raw:      "(a => a + b)(1)",
        scope:    { b: 1 },
        toString: "((a) => a + b)(1)",
        type:     CallExpression,
        value:    2,
    },
    {
        raw:      "((a = 1) => a + b)()",
        scope:    { b: 1 },
        toString: "((a = 1) => a + b)()",
        type:     CallExpression,
        value:    2,
    },
    {
        raw:      "((a = 1) => a + b)(2)",
        scope:    { b: 1 },
        toString: "((a = 1) => a + b)(2)",
        type:     CallExpression,
        value:    3,
    },
    {
        raw:      "((a, b) => a + b)(1, 2)",
        scope:    { b: 1 },
        toString: "((a, b) => a + b)(1, 2)",
        type:     CallExpression,
        value:    3,
    },
    {
        raw:      "((...a) => a)(1, 2)",
        scope:    { },
        toString: "((...a) => a)(1, 2)",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "((...[a, b]) => [a, b])(1, 2)",
        scope:    { },
        toString: "((...[a, b]) => [a, b])(1, 2)",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "(([a, b]) => [a, b])([1, 2])",
        scope:    { },
        toString: "(([a, b]) => [a, b])([1, 2])",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "(([a, ...b]) => [a, b])([1, 2, 3])",
        scope:    { },
        toString: "(([a, ...b]) => [a, b])([1, 2, 3])",
        type:     CallExpression,
        value:    [1, [2, 3]],
    },
    {
        raw:      "(([, b]) => [b])([1, 2])",
        scope:    { },
        toString: "(([, b]) => [b])([1, 2])",
        type:     CallExpression,
        value:    [2],
    },
    {
        raw:      "(({ a, b }) => [a, b])({ a: 1, b: 2 })",
        scope:    { },
        toString: "(({ a, b }) => [a, b])({ a: 1, b: 2 })",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "(({ a: { b: { c: { d } } } }) => d)({ a: { b: { c: { d: 2 } } } })",
        scope:    { },
        toString: "(({ a: { b: { c: { d } } } }) => d)({ a: { b: { c: { d: 2 } } } })",
        type:     CallExpression,
        value:    2,
    },
    {
        raw:      "(({ a: { b: { c: [d] } } }) => d)({ a: { b: { c: [2] } } })",
        scope:    { },
        toString: "(({ a: { b: { c: [d] } } }) => d)({ a: { b: { c: [2] } } })",
        type:     CallExpression,
        value:    2,
    },
    {
        raw:      "(({ a = 1, b }) => [a, b])({ b: 2 })",
        scope:    { },
        toString: "(({ a = 1, b }) => [a, b])({ b: 2 })",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "(({ a, ...b }) => [a, b])({ a: 1, b: 2, c: 3 })",
        scope:    { },
        toString: "(({ a, ...b }) => [a, b])({ a: 1, b: 2, c: 3 })",
        type:     CallExpression,
        value:    [1, { b: 2, c: 3 }],
    },
    {
        raw:      "(({ [x]: a, b }) => [a, b])({ a: 1, b: 2 })",
        scope:    { x: "a" },
        toString: "(({ [x]: a, b }) => [a, b])({ a: 1, b: 2 })",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "(({ c: a = 1, b }) => [a, b])({ b: 2 })",
        scope:    { },
        toString: "(({ c: a = 1, b }) => [a, b])({ b: 2 })",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "(({ [x]: a = 1, b }) => [a, b])({ b: 2 })",
        scope:    { x: "a" },
        toString: "(({ [x]: a = 1, b }) => [a, b])({ b: 2 })",
        type:     CallExpression,
        value:    [1, 2],
    },
    {
        raw:      "id ?? 2",
        scope:    { id: 1 },
        toString: "id ?? 2",
        type:     LogicalExpression,
        value:    1,
    },
    {
        raw:      "id ?? 2",
        scope:    { id: null },
        toString: "id ?? 2",
        type:     LogicalExpression,
        value:    2,
    },
    {
        raw:      "id ?? 0 || lastId ?? 4",
        scope:    { id: 1, lastId: 2 },
        toString: "id ?? 0 || lastId ?? 4",
        type:     LogicalExpression,
        value:    1,
    },
    {
        raw:      "id ?? 0 || lastId ?? 4",
        scope:    { id: null, lastId: null },
        toString: "id ?? 0 || lastId ?? 4",
        type:     LogicalExpression,
        value:    4,
    },
    {
        raw:      "11 * 10 + 9 << 8 > 7 == 6 & 5 ^ 4 | 3 && 2 || 1 ?? 0",
        scope,
        toString: "11 * 10 + 9 << 8 > 7 == 6 & 5 ^ 4 | 3 && 2 || 1 ?? 0",
        type:     LogicalExpression,
        value:    2,
    },
    {
        raw:      "0 ?? 1 || 2 && 3 | 4 ^ 5 & 6 == 7 > 8 << 9 + 10 * 11",
        scope,
        toString: "0 ?? 1 || 2 && 3 | 4 ^ 5 & 6 == 7 > 8 << 9 + 10 * 11",
        type:     LogicalExpression,
        value:    0,
    },
    {
        raw:      "1 > 2 ? \"greater\" : \"smaller\"",
        scope,
        toString: "1 > 2 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression,
        value:    "smaller",
    },
    {
        raw:      "2 > 1 ? \"greater\" : \"smaller\"",
        scope,
        toString: "2 > 1 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression,
        value:    "greater",
    },
    {
        raw:      "undefined",
        scope,
        toString: "undefined",
        type:     Identifier,
        value:    undefined,
    },
    {
        raw:      "1",
        scope,
        toString: "1",
        type:     Literal,
        value:    1,
    },
    {
        raw:      "\"double quotes\"",
        scope,
        toString: "\"double quotes\"",
        type:     Literal,
        value:    "double quotes",
    },
    {
        raw:      "'single quotes'",
        scope,
        toString: "\"single quotes\"",
        type:     Literal,
        value:    "single quotes",
    },
    {
        raw:      "true",
        scope,
        toString: "true",
        type:     Literal,
        value:    true,
    },
    {
        raw:      "false",
        scope,
        toString: "false",
        type:     Literal,
        value:    false,
    },
    {
        raw:      "null",
        scope,
        toString: "null",
        type:     Literal,
        value:    null,
    },
    {
        raw:      "/test/",
        scope,
        toString: "/test/",
        type:     Literal,
        value:    /test/,
    },
    {
        raw:      "/test/gi",
        scope,
        toString: "/test/gi",
        type:     Literal,
        value:    /test/gi,
    },
    {
        raw:      "true && false",
        scope,
        toString: "true && false",
        type:     LogicalExpression,
        value:    false,
    },
    {
        raw:      "true || false",
        scope,
        toString: "true || false",
        type:     LogicalExpression,
        value:    true,
    },
    {
        raw:      "false || true && !false",
        scope,
        toString: "false || true && !false",
        type:     LogicalExpression,
        value:    true,
    },
    {
        raw:      "this.new",
        scope,
        toString: "this.new",
        type:     MemberExpression,
        value:    "new",
    },
    {
        raw:      "this.id",
        scope:    { this: { id: 1 } },
        toString: "this.id",
        type:     MemberExpression,
        value:    1,
    },
    {
        raw:      "this.increment",
        scope,
        toString: "this.increment",
        type:     MemberExpression,
        value:    scope.this.increment,
    },
    {
        raw:      "this['increment']",
        scope,
        toString: "this[\"increment\"]",
        type:     MemberExpression,
        value:    scope.this.increment,
    },
    {
        raw:      "this['x', 'increment']",
        scope,
        toString: "this[(\"x\", \"increment\")]",
        type:     MemberExpression,
        value:    scope.this.increment,
    },
    {
        raw:      "this?.id",
        scope:    { this: { id: 1 } },
        toString: "this?.id",
        type:     ChainExpression,
        value:    1,
    },
    {
        raw:      "this?.id",
        scope:    { this: null },
        toString: "this?.id",
        type:     ChainExpression,
        value:    undefined,
    },
    {
        raw:      "this?.['id']",
        scope:    { this: { id: 1 } },
        toString: "this?.[\"id\"]",
        type:     ChainExpression,
        value:    1,
    },
    {
        raw:      "this?.['id']",
        scope:    { this: null },
        toString: "this?.[\"id\"]",
        type:     ChainExpression,
        value:    undefined,
    },
    {
        raw:      "this.getObject().value",
        scope,
        toString: "this.getObject().value",
        type:     MemberExpression,
        value:    "Hello World!!!",
    },
    {
        raw:      "new MyClass",
        scope,
        toString: "new MyClass()",
        type:     NewExpression,
        value:    { active: false, id: 0 },
    },
    {
        raw:      "new MyClass(1, true)",
        scope,
        toString: "new MyClass(1, true)",
        type:     NewExpression,
        value:    { active: true, id: 1 },
    },
    {
        raw:      "new MyClass(...factory())",
        scope:    { ...scope, factory: (): unknown => [1, true] },
        toString: "new MyClass(...factory())",
        type:     NewExpression,
        value:    { active: true, id: 1 },
    },
    {
        raw:      "{ }",
        scope,
        toString: "{ }",
        type:     ObjectExpression,
        value:    { },
    },
    {
        raw:      "{ 1: 1 }",
        scope,
        toString: "{ 1: 1 }",
        type:     ObjectExpression,
        value:    { 1: 1 },
    },
    {
        raw:      "{ new: 1 }",
        scope,
        toString: "{ new: 1 }",
        type:     ObjectExpression,
        value:    { new: 1 },
    },
    {
        raw:      "{ true: 1 }",
        scope,
        toString: "{ true: 1 }",
        type:     ObjectExpression,
        value:    { true: 1 },
    },
    {
        raw:      "{ foo: 1, bar: [1, ...[2, 3]], [{id: 1}.id]: 1 }",
        scope,
        toString: "{ foo: 1, bar: [1, ...[2, 3]], [{ id: 1 }.id]: 1 }",
        type:     ObjectExpression,
        value:    { bar: [1, 2, 3], [{ id: 1 }.id]: 1, foo: 1 },
    },
    {
        raw:      "{ foo: 'bar', ...{ id: 2, value: 3 } }",
        scope,
        toString: "{ foo: \"bar\", ...{ id: 2, value: 3 } }",
        type:     ObjectExpression,
        value:    { foo: "bar", id: 2, value: 3 },
    },
    {
        raw:      "{ foo: 'bar', ...[1, 2] }",
        scope,
        toString: "{ foo: \"bar\", ...[1, 2] }",
        type:     ObjectExpression,
        value:    { 0: 1, 1: 2, foo: "bar" },
    },
    {
        raw:      "{ id }",
        scope:    { id: 1 },
        toString: "{ id }",
        type:     ObjectExpression,
        value:    { id: 1 },
    },
    {
        raw:      "{ [id]: 2 }",
        scope:    { id: 1 },
        toString: "{ [id]: 2 }",
        type:     ObjectExpression,
        value:    { 1: 2 },
    },
    {
        raw:      "{ foo: 1, ...factory() }",
        scope:    { factory: (): unknown => ({ id: 1 }) },
        toString: "{ foo: 1, ...factory() }",
        type:     ObjectExpression,
        value:    { foo: 1, id: 1 },
    },
    {
        raw:      "x++, y + x",
        scope:    { x: 1, y: 2 },
        toString: "(x++, y + x)",
        type:     SequenceExpression,
        value:    4,
    },
    {
        raw:      "(x++, y + x)",
        scope:    { x: 1, y: 2 },
        toString: "(x++, y + x)",
        type:     SequenceExpression,
        value:    4,
    },
    {
        raw:      "`The id is: ${this.id}`",
        scope,
        toString: "`The id is: ${this.id}`",
        type:     TemplateLiteral,
        value:    "The id is: 1",
    },
    {
        raw:      "`The id is: ${1, 2, 3}`",
        scope,
        toString: "`The id is: ${(1, 2, 3)}`",
        type:     TemplateLiteral,
        value:    "The id is: 3",
    },
    {
        raw:      "tag`\\tHello ${name}!!!`",
        scope:    { name: "World", tag: (...args: unknown[]): unknown => args },
        toString: "tag`\\tHello ${name}!!!`",
        type:     TaggedTemplateExpression,
        value:    [makeTemplateObject(["\tHello ", "!!!"], ["\\tHello ", "!!!"]), "World"],
    },
    {
        raw:      "x.tag`\\tHello ${name}!!!`",
        scope:    { name: "World", x: { tag: (...args: unknown[]): unknown => args } },
        toString: "x.tag`\\tHello ${name}!!!`",
        type:     TaggedTemplateExpression,
        value:    [makeTemplateObject(["\tHello ", "!!!"], ["\\tHello ", "!!!"]), "World"],
    },
    {
        raw:      "this",
        scope:    { this: { id: 1 } },
        toString: "this",
        type:     ThisExpression,
        value:    { id: 1 },
    },
    {
        raw:      "+1",
        scope,
        toString: "+1",
        type:     UnaryExpression,
        value:    1,
    },
    {
        raw:      "-1",
        scope,
        toString: "-1",
        type:     UnaryExpression,
        value:    -1,
    },
    {
        raw:      "~1",
        scope,
        toString: "~1",
        type:     UnaryExpression,
        value:    -2,
    },
    {
        raw:      "!true",
        scope,
        toString: "!true",
        type:     UnaryExpression,
        value:    false,
    },
    {
        raw:      "!!true",
        scope,
        toString: "!!true",
        type:     UnaryExpression,
        value:    true,
    },
    {
        raw:      "typeof 1",
        scope,
        toString: "typeof 1",
        type:     UnaryExpression,
        value:    "number",
    },
    {
        raw:      "++value",
        scope:    { value: 1 },
        toString: "++value",
        type:     UpdateExpression,
        value:    2,
    },
    {
        raw:      "識別子--",
        scope:    { 識別子: 1 },
        toString: "識別子--",
        type:     UpdateExpression,
        value:    1,
    },
    {
        raw:      "++this.value",
        scope:    { this: { value: 1 } },
        toString: "++this.value",
        type:     UpdateExpression,
        value:    2,
    },
    {
        raw:      "--this.value",
        scope:    { this: { value: 1 } },
        toString: "--this.value",
        type:     UpdateExpression,
        value:    0,
    },
    {
        raw:      "--this[key]",
        scope:    { key: "value", this: { value: 1 } },
        toString: "--this[key]",
        type:     UpdateExpression,
        value:    0,
    },
    {
        raw:      "this.value++",
        scope:    { this: { value: 1 } },
        toString: "this.value++",
        type:     UpdateExpression,
        value:    1,
    },
    {
        raw:      "this[key]++",
        scope:    { key: "value", this: { value: 1 } },
        toString: "this[key]++",
        type:     UpdateExpression,
        value:    1,
    },
    {
        raw:      "this.value--",
        scope:    { this: { value: 1 } },
        toString: "this.value--",
        type:     UpdateExpression,
        value:    1,
    },
];

export const invalidExpressions: InvalidParseExpectedSpec[] =
[
    {
        error: new SyntaxError(Messages.invalidLeftHandSideInAssignment, 1, 0, 1),
        raw:   "(x || y) = 1",
    },
    {
        error: new SyntaxError(Messages.invalidLeftHandSideExpressionInPrefixOperation, 1, 2, 3),
        raw:   "++true",
    },
    {
        error: new SyntaxError(Messages.invalidLeftHandSideExpressionInPostfixOperation, 1, 0, 1),
        raw:   "true++",
    },
    {
        error: new SyntaxError(Messages.invalidLeftHandSideExpressionInPrefixOperation, 1, 2, 3),
        raw:   "++(x || y)",
    },
    {
        error: new SyntaxError(Messages.invalidLeftHandSideExpressionInPostfixOperation, 1, 0, 1),
        raw:   "(x || y)++",
    },
    {
        error: new SyntaxError(Messages.unexpectedString, 1, 5, 6),
        raw:   "this.''",
    },
    {
        error: new SyntaxError(Messages.unexpectedNumber, 1, 4, 5),
        raw:   "this.1",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "." }), 1, 0, 1),
        raw:   ".",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "if" }), 1, 0, 1),
        raw:   "if",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "?" }), 1, 5, 6),
        raw:   "this.?",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "?" }), 1, 6, 7),
        raw:   "this?.?",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "if" }), 1, 5, 6),
        raw:   "this if",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "{" }), 1, 5, 6),
        raw:   "x => { }",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "{" }), 1, 6, 7),
        raw:   "() => { }",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "{" }), 1, 10, 11),
        raw:   "(x, y) => { }",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "(" }), 1, 3, 4),
        raw:   "({ (foo) })",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "}" }), 1, 7, 8),
        raw:   "({ new })",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "" }), 1, 3, 4),
        raw:   "({ `x`: 1 })",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "if" }), 1, 4, 5),
        raw:   "1 + if",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "?" }), 1, 2, 3),
        raw:   "[ ? ]",
    },
    {
        error: new SyntaxError(Messages.unexpectedEndOfExpression, 1, 0, 1),
        raw:   "",
    },
    {
        error: new SyntaxError(Messages.unexpectedEndOfExpression, 1, 14, 15),
        raw:   "1 < 2 ? true .",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "=" }), 1, 3, 4),
        raw:   "() = 1",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 1, 2),
        raw:   "(a += 1) => 1",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 1, 2),
        raw:   "([a += 1]) => 1",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 5, 6),
        raw:   "(...[a += 1]) => 1",
    },
    {
        error: new SyntaxError(Messages.illegalPropertyInDeclarationContext, 1, 1, 2),
        raw:   "(x.y = 1) => 1",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "=" }), 1, 5, 6),
        raw:   "({ x = 1 })",
    },
    {
        error: new SyntaxError(Messages.illegalPropertyInDeclarationContext, 1, 1, 2),
        raw:   "([x.y]) => 1",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 1, 2),
        raw:   "([1]) => 0",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 6, 7),
        raw:   "([a], [1]) => 0",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 1, 2),
        raw:   "({ x: 1 }) => 1",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "." }), 1, 4, 5),
        raw:   "({ x.y }) => 1",
    },
    {
        error: new SyntaxError(Messages.illegalPropertyInDeclarationContext, 1, 1, 2),
        raw:   "({ x: x.y }) => 1",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 1, 2),
        raw:   "([{ x: 1 }]) => 1",
    },
    {
        error: new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 1, 2),
        raw:   "(...x, y) => 1",
    },
    {
        error: new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 4, 5),
        raw:   "(x, ...y, z) => 1",
    },
    {
        error: new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 1, 2),
        raw:   "([...x, y]) => 1",
    },
    {
        error: new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 9, 10),
        raw:   "(...[...x, y]) => 1",
    },
    {
        error: new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 10, 11),
        raw:   "(...[{ ...x, y }]) => 1",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "{" }), 1, 9, 10),
        raw:   "(...{ a, { b }}) => a + b",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 4, 5),
        raw:   "(a, { b, x: { c: 1 } }) => a + b + c",
    },
    {
        error: new SyntaxError(Messages.restOperatorMustBeFollowedByAnIdentifierInDeclarationContexts, 1, 12, 13),
        raw:   "(...{ a, ...{ b } }) => a",
    },
    {
        error: new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 1, 2),
        raw:   "({ ...{ a }, b }) => a",
    },
    {
        error: new SyntaxError(Messages.restParameterMayNotHaveAdefaultInitializer, 1, 1, 2),
        raw:   "(...a = []) => a",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 8, 9),
        raw:   "(...[...a = 1]) => a",
    },
    {
        error: new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 1, 2),
        raw:   "([x, ...y = []]) => y",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, a) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 1, 2),
        raw:   "(...[a, a]) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, [a]) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, [b, { b }]) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, [b, { x: b }]) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, [b, { x: { b } }]) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, [b, { x: { c, c } }]) => a",
    },
    {
        error: new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 4, 5),
        raw:   "(a, [b, { x: { c, ...c } }]) => a",
    },
    {
        error: new SyntaxError(format(Messages.unexpectedToken, { token: "z" }), 1, 5, 6),
        raw:   "x, y z",
    },
    {
        error: new SyntaxError(Messages.invalidLeftHandSideInAssignment, 1, 7, 8),
        raw:   "x || x = 1",
    },
    {
        error: new SyntaxError(Messages.malformedArrowFunctionParameterList, 1, 7, 8),
        raw:   "x || x => x",
    },
];