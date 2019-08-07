import { Constructor, Indexer, Nullable } from "@surface/core";
import { format }                         from "@surface/core/common/string";
import IExpression                        from "../../interfaces/expression";
import ArrayExpression                    from "../../internal/expressions/array-expression";
import ArrowFunctionExpression            from "../../internal/expressions/arrow-function-expression";
import AssignmentExpression               from "../../internal/expressions/assignment-expression";
import BinaryExpression                   from "../../internal/expressions/binary-expression" ;
import CallExpression                     from "../../internal/expressions/call-expression";
import CoalesceExpression                 from "../../internal/expressions/coalesce-expression";
import ConditionalExpression              from "../../internal/expressions/conditional-expression";
import Identifier                         from "../../internal/expressions/identifier";
import Literal                            from "../../internal/expressions/literal";
import LogicalExpression                  from "../../internal/expressions/logical-expression";
import MemberExpression                   from "../../internal/expressions/member-expression";
import NewExpression                      from "../../internal/expressions/new-expression";
import ObjectExpression                   from "../../internal/expressions/object-expression";
import SequenceExpression                 from "../../internal/expressions/sequence-expression";
import TaggedTemplateExpression           from "../../internal/expressions/tagged-template-expression";
import TemplateLiteral                    from "../../internal/expressions/template-literal";
import ThisExpression                     from "../../internal/expressions/this-expression";
import UnaryExpression                    from "../../internal/expressions/unary-expression";
import UpdateExpression                   from "../../internal/expressions/update-expression";
import Messages                           from "../../internal/messages";
import SyntaxError                        from "../../syntax-error";

export type ExpressionFixtureSpec =
{
    scope:    Indexer,
    raw:      string,
    toString: string,
    type:     Constructor<IExpression>,
    value:    Nullable<Object>,
};

export type InvalidExpressionFixtureSpec =
{
    scope: Object,
    error: Error,
    raw:   string,
};

const scope =
{
    this:
    {
        id:        1,
        value:     1,
        value1:    0,
        new:       "new",
        greater:   (left: number, right: number) => left > right,
        lesser:    (left: number, right: number) => left < right,
        increment: (value: number) => ++value,
        getObject: () => ({ value: "Hello World!!!" }),
        getValue:  () => 42
    },
    getScope()
    {
        return this;
    },
    MyClass: class MyClass
    {
        public id:     number;
        public active: boolean;

        public constructor(id?: number, active?: boolean)
        {
            this.id     = id || 0;
            this.active = !!active;
        }

        public getId(): number
        {
            return this.id;
        }
    },
    noop(value: unknown)
    {
        return value;
    },
    object:
    {
        getValue(): number
        {
            return 1;
        }
    }
};

function makeTemplateObject(cooked: Array<string>, raw: Array<string>): Array<string>
{
    Object.defineProperty(cooked, "raw", { value: raw });

    return cooked;
}

// tslint:disable-next-line:no-any
export const validExpressions: Array<ExpressionFixtureSpec> =
[
    {
        scope:    scope,
        raw:      "[]",
        value:    [],
        toString: "[]",
        type:     ArrayExpression,
    },
    {
        scope:    scope,
        raw:      "[, 1, 2, , 3, ,]",
        value:    [undefined, 1, 2, undefined, 3, undefined,],
        toString: "[undefined, 1, 2, undefined, 3, undefined]",
        type:     ArrayExpression,
    },
    {
        scope:    scope,
        raw:      "[1, 'foo', true, { foo: 'bar' }]",
        value:    [1, "foo", true, { foo: "bar" }],
        toString: "[1, \"foo\", true, { foo: \"bar\" }]",
        type:     ArrayExpression,
    },
    {
        scope:    { one: 1, two: 2 },
        raw:      "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",
        value:    [1, "foo", true, { foo: 1 }, { bar: 2 }],
        toString: "[1, \"foo\", true, ...[{ foo: one }, { bar: two }]]",
        type:     ArrayExpression,
    },
    {
        scope:    { factory: () => [1, 2, 3] },
        raw:      "[0, ...factory()]",
        value:    [0, 1, 2, 3],
        toString: "[0, ...factory()]",
        type:     ArrayExpression,
    },
    {
        scope:    scope,
        raw:      "() => undefined",
        value:    () => undefined,
        toString: "() => undefined",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "a => a++",
        value:    (a: number) => a++,
        toString: "(a) => a++",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a) => a++",
        value:    (a: number) => a++,
        toString: "(a) => a++",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a = 1) => a++",
        value:    (a: number = 1) => a++,
        toString: "(a = 1) => a++",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, b) => a + b",
        value:    (a: number, b: number) => a + b,
        toString: "(a, b) => a + b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "([a]) => a",
        value:    ([a]: Array<string>) => a,
        toString: "([a]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "([a], [b]) => [a, b]",
        value:    ([a]: Array<string>, [b]: Array<string>) => [a, b],
        toString: "([a], [b]) => [a, b]",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "([, a]) => a",
        value:    ([, a]: Array<string>) => a,
        toString: "([, a]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "([a = 1]) => a",
        value:    ([a = 1]: Array<number>) => a,
        toString: "([a = 1]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, [b, c]) => a + b + c",
        value:    (a: number, [b, c]: Array<number>) => a + b + c,
        toString: "(a, [b, c]) => a + b + c",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, [b, [c]]) => a + b + c",
        value:    (a: number, [b, [c]]: [number, Array<number>]) => a + b + c,
        toString: "(a, [b, [c]]) => a + b + c",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...a) => a",
        value:    (...a: Array<number>) => a,
        toString: "(...a) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, ...b) => [a, ...b]",
        value:    (a: number, ...b: Array<number>) => [a, ...b],
        toString: "(a, ...b) => [a, ...b]",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a]) => a",
        value:    (...[a]: Array<number>) => a,
        toString: "(...[a]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[, a]) => a",
        value:    (...[, a]: Array<number>) => a,
        toString: "(...[, a]) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a, ...b]) => a + b[0]",
        value:    (...[a, ...b]: Array<number>) => a + b[0],
        toString: "(...[a, ...b]) => a + b[0]",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a, [b]]) => a + b",
        value:    (...[a, [b]]: [number, Array<number>]) => a + b,
        toString: "(...[a, [b]]) => a + b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a, { b }]) => a + b",
        value:    (...[a, { b }]: [number, { b: number }]) => a + b,
        toString: "(...[a, { b }]) => a + b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[a, { b, ...c }]) => a + b + c.x + c.y + c.z",
        value:    (...[a, { b, ...c }]: [number, { b: number, x: number, y: number, z: number }]) => a + b + c.x + c.y + c.z,
        toString: "(...[a, { b, ...c }]) => a + b + c.x + c.y + c.z",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a }) => a",
        value:    ({ a }: { a: string }) => a,
        toString: "({ a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ \"a\": a }) => a",
        value:    ({ "a": a }: { "a": string }) => a,
        toString: "({ \"a\": a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ 0: a }) => a",
        value:    ({ 0: a }: { 0: string }) => a,
        toString: "({ 0: a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ [0]: a }) => a",
        value:    ({ [0]: a }: { [key: number]: string }) => a,
        toString: "({ [0]: a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ [scope.this.id]: a }) => a",
        value:    ({ [scope.this.id]: a }: { [key: number]: string }) => a,
        toString: "({ [scope.this.id]: a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a = 1 }) => a",
        value:    ({ a = 1 }: { a: number }) => a,
        toString: "({ a = 1 }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a: b }) => b",
        value:    ({ a: b }: { a: number }) => b,
        toString: "({ a: b }) => b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "({ a: [x] }) => x",
        value:    ({ a: [x] }: { a: Array<number> }) => x,
        toString: "({ a: [x] }) => x",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...[{ a: [x] }]) => x",
        value:    (...[{ a: [x] }]: Array<{ a: Array<number> }>) => x,
        toString: "(...[{ a: [x] }]) => x",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, { b, x: { c } }) => a + b + c",
        value:    (a: number, { b, x: { c } }: { b: number, x: { c: number } }) => a + b + c,
        toString: "(a, { b, x: { c } }) => a + b + c",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(a, { b, x: { ...c } }) => [a, b, c]",
        value:    (a: number, { b, x: { ...c } }: { b: number, x: { c: number } }) => [a, b, c],
        toString: "(a, { b, x: { ...c } }) => [a, b, c]",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...{ a }) => a",
        value:    (...{ a }: { a: number }) => a,
        toString: "(...{ a }) => a",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "(...{ a, x: { b } }) => a + b",
        value:    (...{ a, x: { b } }: { a: number, x: { b: number } }) => a + b,
        toString: "(...{ a, x: { b } }) => a + b",
        type:     ArrowFunctionExpression,
    },
    {
        scope:    scope,
        raw:      "this.value = 0",
        value:    0,
        toString: "this.value = 0",
        type:     AssignmentExpression
    },
    {
        scope:    { this: { value: 1 }, key: "value" },
        raw:      "this[key] = 0",
        value:    0,
        toString: "this[key] = 0",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value = this.value1 += 2",
        value:    2,
        toString: "this.value = this.value1 += 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value *= 2",
        value:    4,
        toString: "this.value *= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value **= 2",
        value:    16,
        toString: "this.value **= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value /= 2",
        value:    8,
        toString: "this.value /= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value %= 2",
        value:    0,
        toString: "this.value %= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value += 2",
        value:    2,
        toString: "this.value += 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value -= 1",
        value:    1,
        toString: "this.value -= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value <<= 2",
        value:    4,
        toString: "this.value <<= 2",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value >>= 1",
        value:    2,
        toString: "this.value >>= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value >>>= 1",
        value:    1,
        toString: "this.value >>>= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value &= 1",
        value:    1,
        toString: "this.value &= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value ^= 1",
        value:    0,
        toString: "this.value ^= 1",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "this.value |= 1",
        value:    1,
        toString: "this.value |= 1",
        type:     AssignmentExpression
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x = y++",
        value:    2,
        toString: "x = y++",
        type:     AssignmentExpression
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x = ++y",
        value:    3,
        toString: "x = ++y",
        type:     AssignmentExpression
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x += (x++, x + y)",
        value:    6,
        toString: "x += (x++, x + y)",
        type:     AssignmentExpression
    },
    {
        scope:    scope,
        raw:      "1 + 1",
        value:    2,
        toString: "1 + 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 - 1",
        value:    0,
        toString: "1 - 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "2 * 2",
        value:    4,
        toString: "2 * 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "4 / 2",
        value:    2,
        toString: "4 / 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "10 % 3",
        value:    1,
        toString: "10 % 3",
        type:     BinaryExpression,
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "'id' in this",
        value:    true,
        toString: "\"id\" in this",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 == 1",
        value:    true,
        toString: "1 == 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 === 1",
        value:    true,
        toString: "1 === 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 != 1",
        value:    false,
        toString: "1 != 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 !== 1",
        value:    false,
        toString: "1 !== 1",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "({ }) instanceof { }.constructor",
        value:    true,
        toString: "({ }) instanceof { }.constructor",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 <= 0",
        value:    false,
        toString: "1 <= 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 >= 0",
        value:    true,
        toString: "1 >= 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 > 0",
        value:    true,
        toString: "1 > 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 < 0",
        value:    false,
        toString: "1 < 0",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 & 2",
        value:    0,
        toString: "1 & 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 | 2",
        value:    3,
        toString: "1 | 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "1 ^ 2",
        value:    3,
        toString: "1 ^ 2",
        type:     BinaryExpression,
    },
    {
        scope:    scope,
        raw:      "2 ** 2",
        value:    4,
        toString: "2 ** 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "0b1000 << 2",
        value:    0b100000,
        toString: "8 << 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "0b1000 >> 2",
        value:    0b10,
        toString: "8 >> 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "0b1000 >>> 2",
        value:    0b10,
        toString: "8 >>> 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "1 + 1 * 2 / 2",
        value:    2,
        toString: "1 + 1 * 2 / 2",
        type:     BinaryExpression
    },
    {
        scope:    scope,
        raw:      "noop(true)",
        value:    true,
        toString: "noop(true)",
        type:     CallExpression,
    },
    {
        scope:    { fn: () => true },
        raw:      "fn?.()",
        value:    true,
        toString: "fn?.()",
        type:     CallExpression,
    },
    {
        scope:    { fn: null },
        raw:      "fn?.()",
        value:    undefined,
        toString: "fn?.()",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "getScope()",
        value:    null,
        toString: "getScope()",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.getValue()",
        value:    42,
        toString: "this.getValue()",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.increment(1)",
        value:    2,
        toString: "this.increment(1)",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.greater(1, 2)",
        value:    false,
        toString: "this.greater(1, 2)",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "this.greater(...[1, 2],)",
        value:    false,
        toString: "this.greater(...[1, 2])",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "object.getValue()",
        value:    1,
        toString: "object.getValue()",
        type:     CallExpression,
    },
    {
        scope:    scope,
        raw:      "/test/.test(\"test\")",
        value:    true,
        toString: "/test/.test(\"test\")",
        type:     CallExpression
    },
    {
        scope:    scope,
        raw:      "/test/i.test(\"TEST\")",
        value:    true,
        toString: "/test/i.test(\"TEST\")",
        type:     CallExpression
    },
    {
        scope:    scope,
        raw:      "(true ? this.greater : this.lesser)(1, 2)",
        value:    false,
        toString: "(true ? this.greater : this.lesser)(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { greater: (a: number, b: number) => a == 1 && b == 2, factory: () => [1, 2] },
        raw:      "greater(...factory())",
        value:    true,
        toString: "greater(...factory())",
        type:     CallExpression
    },
    {
        scope:    { ...scope, factory: () => [2, true]},
        raw:      "new MyClass(...factory()).getId()",
        value:    2,
        toString: "new MyClass(...factory()).getId()",
        type:     CallExpression,
    },
    {
        scope:    { },
        raw:      "(() => 1)()",
        value:    1,
        toString: "(() => 1)()",
        type:     CallExpression
    },
    {
        scope:      { b: 1 },
        raw:      "(a => a + b)(1)",
        value:    2,
        toString: "((a) => a + b)(1)",
        type:     CallExpression
    },
    {
        scope:    { b: 1 },
        raw:      "((a = 1) => a + b)()",
        value:    2,
        toString: "((a = 1) => a + b)()",
        type:     CallExpression
    },
    {
        scope:    { b: 1 },
        raw:      "((a, b) => a + b)(1, 2)",
        value:    3,
        toString: "((a, b) => a + b)(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "((...a) => a)(1, 2)",
        value:    [1, 2],
        toString: "((...a) => a)(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "((...[a, b]) => [a, b])(1, 2)",
        value:    [1, 2],
        toString: "((...[a, b]) => [a, b])(1, 2)",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(([a, b]) => [a, b])([1, 2])",
        value:    [1, 2],
        toString: "(([a, b]) => [a, b])([1, 2])",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(([a, ...b]) => [a, b])([1, 2, 3])",
        value:    [1, [2, 3]],
        toString: "(([a, ...b]) => [a, b])([1, 2, 3])",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(([, b]) => [b])([1, 2])",
        value:    [2],
        toString: "(([, b]) => [b])([1, 2])",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(({ a, b }) => [a, b])({ a: 1, b: 2 })",
        value:    [1, 2],
        toString: "(({ a, b }) => [a, b])({ a: 1, b: 2 })",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(({ a = 1, b }) => [a, b])({ b: 2 })",
        value:    [1, 2],
        toString: "(({ a = 1, b }) => [a, b])({ b: 2 })",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(({ a, ...b }) => [a, b])({ a: 1, b: 2, c: 3 })",
        value:    [1, { b: 2, c: 3 }],
        toString: "(({ a, ...b }) => [a, b])({ a: 1, b: 2, c: 3 })",
        type:     CallExpression
    },
    {
        scope:    { x: "a" },
        raw:      "(({ [x]: a, b }) => [a, b])({ a: 1, b: 2 })",
        value:    [1, 2],
        toString: "(({ [x]: a, b }) => [a, b])({ a: 1, b: 2 })",
        type:     CallExpression
    },
    {
        scope:    { },
        raw:      "(({ c: a = 1, b }) => [a, b])({ b: 2 })",
        value:    [1, 2],
        toString: "(({ c: a = 1, b }) => [a, b])({ b: 2 })",
        type:     CallExpression
    },
    {
        scope:    { x: "a" },
        raw:      "(({ [x]: a = 1, b }) => [a, b])({ b: 2 })",
        value:    [1, 2],
        toString: "(({ [x]: a = 1, b }) => [a, b])({ b: 2 })",
        type:     CallExpression
    },
    {
        scope:    { id: 1 },
        raw:      "id ?? 2",
        value:    1,
        toString: "id ?? 2",
        type:     CoalesceExpression
    },
    {
        scope:    { id: null },
        raw:      "id ?? 2",
        value:    2,
        toString: "id ?? 2",
        type:     CoalesceExpression
    },
    {
        scope:    { id: 1, lastId: 2 },
        raw:      "id ?? 0 || lastId ?? 4",
        value:    1,
        toString: "id ?? 0 || lastId ?? 4",
        type:     CoalesceExpression
    },
    {
        scope:    { id: null, lastId: null },
        raw:      "id ?? 0 || lastId ?? 4",
        value:    4,
        toString: "id ?? 0 || lastId ?? 4",
        type:     CoalesceExpression
    },
    {
        scope:    scope,
        raw:      "1 > 2 ? \"greater\" : \"smaller\"",
        value:    "smaller",
        toString: "1 > 2 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression
    },
    {
        scope:    scope,
        raw:      "2 > 1 ? \"greater\" : \"smaller\"",
        value:    "greater",
        toString: "2 > 1 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression
    },
    {
        scope:    scope,
        raw:      "undefined",
        value:    undefined,
        toString: "undefined",
        type:     Identifier,
    },
    {
        scope:    scope,
        raw:      "1",
        value:    1,
        toString: "1",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "\"double quotes\"",
        value:    "double quotes",
        toString: "\"double quotes\"",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "'single quotes'",
        value:    "single quotes",
        toString: "\"single quotes\"",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "true",
        value:    true,
        toString: "true",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "false",
        value:    false,
        toString: "false",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "null",
        value:    null,
        toString: "null",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "/test/",
        value:    /test/,
        toString: "/test/",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "/test/gi",
        value:    /test/gi,
        toString: "/test/gi",
        type:     Literal,
    },
    {
        scope:    scope,
        raw:      "true && false",
        value:    false,
        toString: "true && false",
        type:     LogicalExpression,
    },
    {
        scope:    scope,
        raw:      "true || false",
        value:    true,
        toString: "true || false",
        type:     LogicalExpression,
    },
    {
        scope:    scope,
        raw:      "false || true && !false",
        value:    true,
        toString: "false || true && !false",
        type:     LogicalExpression,
    },
    {
        scope:    scope,
        raw:      "this.new",
        value:    "new",
        toString: "this.new",
        type:     MemberExpression,
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "this.id",
        value:    1,
        toString: "this.id",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this.increment",
        value:    scope.this.increment,
        toString: "this.increment",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this['increment']",
        value:    scope.this.increment,
        toString: "this[\"increment\"]",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this['x', 'increment']",
        value:    scope.this.increment,
        toString: "this[(\"x\", \"increment\")]",
        type:     MemberExpression,
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "this?.id",
        value:    1,
        toString: "this?.id",
        type:     MemberExpression,
    },
    {
        scope:    { this: null },
        raw:      "this?.id",
        value:    undefined,
        toString: "this?.id",
        type:     MemberExpression,
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "this?.['id']",
        value:    1,
        toString: "this?.[\"id\"]",
        type:     MemberExpression,
    },
    {
        scope:    { this: null },
        raw:      "this?.['id']",
        value:    undefined,
        toString: "this?.[\"id\"]",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "this.getObject().value",
        value:    "Hello World!!!",
        toString: "this.getObject().value",
        type:     MemberExpression,
    },
    {
        scope:    scope,
        raw:      "new MyClass",
        value:    { id: 0, active: false },
        toString: "new MyClass()",
        type:     NewExpression,
    },
    {
        scope:    scope,
        raw:      "new MyClass(1, true)",
        value:    { id: 1, active: true },
        toString: "new MyClass(1, true)",
        type:     NewExpression,
    },
    {
        scope:    { ...scope, factory: () => [1, true]},
        raw:      "new MyClass(...factory())",
        value:    { id: 1, active: true },
        toString: "new MyClass(...factory())",
        type:     NewExpression,
    },
    {
        scope:    scope,
        raw:      "{ }",
        value:    { },
        toString: "{ }",
        type:     ObjectExpression,
    },
    {
        scope:   scope,
        raw:      "{ 1: 1 }",
        value:    { 1: 1 },
        toString: "{ 1: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ new: 1 }",
        value:    { new: 1 },
        toString: "{ new: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ true: 1 }",
        value:    { true: 1 },
        toString: "{ true: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ foo: 1, bar: [1, ...[2, 3]], [{id: 1}.id]: 1 }",
        value:    { foo: 1, bar: [1, 2, 3], [{id: 1}.id]: 1 },
        toString: "{ foo: 1, bar: [1, ...[2, 3]], [{ id: 1 }.id]: 1 }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ foo: 'bar', ...{ id: 2, value: 3 } }",
        value:    { foo: "bar", id: 2, value: 3 },
        toString: "{ foo: \"bar\", ...{ id: 2, value: 3 } }",
        type:     ObjectExpression,
    },
    {
        scope:    scope,
        raw:      "{ foo: 'bar', ...[1, 2] }",
        value:    { 0: 1, 1: 2, foo: "bar" },
        toString: "{ foo: \"bar\", ...[1, 2] }",
        type:     ObjectExpression,
    },
    {
        scope:    { id: 1 },
        raw:      "{ id }",
        value:    { id: 1 },
        toString: "{ id }",
        type:     ObjectExpression,
    },
    {
        scope:    { id: 1 },
        raw:      "{ [id]: 2 }",
        value:    { 1: 2 },
        toString: "{ [id]: 2 }",
        type:     ObjectExpression,
    },
    {
        scope:    { factory: () => ({ id: 1 }) },
        raw:      "{ foo: 1, ...factory() }",
        value:    { foo: 1, id: 1 },
        toString: "{ foo: 1, ...factory() }",
        type:     ObjectExpression,
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "x++, y + x",
        value:    4,
        toString: "(x++, y + x)",
        type:     SequenceExpression,
    },
    {
        scope:    { x: 1, y: 2 },
        raw:      "(x++, y + x)",
        value:    4,
        toString: "(x++, y + x)",
        type:     SequenceExpression,
    },
    {
        scope:    scope,
        raw:      "`The id is: ${this.id}`",
        value:    "The id is: 1",
        toString: "`The id is: ${this.id}`",
        type:     TemplateLiteral
    },
    {
        scope:    scope,
        raw:      "`The id is: ${1, 2, 3}`",
        value:    "The id is: 3",
        toString: "`The id is: ${(1, 2, 3)}`",
        type:     TemplateLiteral
    },
    {
        scope:    { name: "World", tag: (...args: Array<unknown>) => args },
        raw:      "tag`\\tHello ${name}!!!`",
        value:    [makeTemplateObject(["\tHello ", "!!!"], ["\\tHello ", "!!!"]), "World"],
        toString: "tag`\\tHello ${name}!!!`",
        type:     TaggedTemplateExpression
    },
    {
        scope:    { this: { id: 1 } },
        raw:      "this",
        value:    { id: 1 },
        toString: "this",
        type:     ThisExpression,
    },
    {
        scope:    scope,
        raw:      "+1",
        value:    1,
        toString: "+1",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "-1",
        value:    -1,
        toString: "-1",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "~1",
        value:    -2,
        toString: "~1",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "!true",
        value:    false,
        toString: "!true",
        type:     UnaryExpression
    },
    {
        scope:    scope,
        raw:      "typeof 1",
        value:    "number",
        toString: "typeof 1",
        type:     UnaryExpression
    },
    {
        scope:    { value: 1 },
        raw:      "++value",
        value:    2,
        toString: "++value",
        type:     UpdateExpression
    },
    {
        scope: { 識別子: 1 },
        raw:      "識別子--",
        value:    1,
        toString: "識別子--",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "++this.value",
        value:    2,
        toString: "++this.value",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "--this.value",
        value:    0,
        toString: "--this.value",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 }, key: "value" },
        raw:      "--this[key]",
        value:    0,
        toString: "--this[key]",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "this.value++",
        value:    1,
        toString: "this.value++",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 }, key: "value" },
        raw:      "this[key]++",
        value:    1,
        toString: "this[key]++",
        type:     UpdateExpression
    },
    {
        scope:    { this: { value: 1 } },
        raw:      "this.value--",
        value:    1,
        toString: "this.value--",
        type:     UpdateExpression
    },
];

export const invalidExpressions: Array<InvalidExpressionFixtureSpec> =
[
    {
        scope:   scope,
        raw:     "this.''",
        error:   new SyntaxError(Messages.unexpectedString, 1, 5, 6)
    },
    {
        scope:   scope,
        raw:     "this.1",
        error:   new SyntaxError(Messages.unexpectedNumber, 1, 4, 5)
    },
    {
        scope:   scope,
        raw:     ".",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "." }), 1, 0, 1)
    },
    {
        scope:   scope,
        raw:     "if",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "if" }), 1, 0, 1)
    },
    {
        scope:   scope,
        raw:     "this.?",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "?" }), 1, 5, 6)
    },
    {
        scope:   scope,
        raw:     "this?.?",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "?" }), 1, 6, 7)
    },
    {
        scope:   scope,
        raw:     "this if",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "if" }), 1, 5, 6)
    },
    {
        scope:   scope,
        raw:     "{ (foo) }",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "(" }), 1, 2, 3)
    },
    {
        scope:   scope,
        raw:     "{ new }",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "}" }), 1, 6, 7)
    },
    {
        scope:   scope,
        raw:     "{ `x`: 1 }",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "" }), 1, 2, 3)
    },
    {
        scope:   scope,
        raw:     "1 + if",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "if" }), 1, 4, 5)
    },
    {
        scope:   scope,
        raw:     "[ ? ]",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "?" }), 1, 2, 3)
    },
    {
        scope:   scope,
        raw:     "",
        error:   new SyntaxError(Messages.unexpectedEndOfExpression, 1, 0, 1)
    },
    {
        scope:   scope,
        raw:     "1 < 2 ? true .",
        error:   new SyntaxError(Messages.unexpectedEndOfExpression, 1, 14, 15)
    },
    {
        scope:   scope,
        raw:     "() = 1",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "=" }), 1, 3, 4)
    },
    {
        scope:   scope,
        raw:     "(a += 1) => 1",
        error:   new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 9, 10)
    },
    {
        scope:   scope,
        raw:     "([a += 1]) => 1",
        error:   new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 11, 12)
    },
    {
        scope:   scope,
        raw:     "(...[a += 1]) => 1",
        error:   new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 11, 12)
    },
    {
        scope:   scope,
        raw:     "(x.y = 1) => 1",
        error:   new SyntaxError(Messages.illegalPropertyInDeclarationContext, 1, 10, 11)
    },
    {
        scope:   scope,
        raw:     "({ x = 1 })",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "=" }), 1, 5, 6)
    },
    {
        scope:   scope,
        raw:     "([x.y]) => 1",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "=>" }), 1, 8, 9)
    },
    {
        scope:   scope,
        raw:     "({ x: 1 }) => 1",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "=>" }), 1, 11, 12)
    },
    {
        scope:   scope,
        raw:     "([{ x: 1 }]) => 1",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "=>" }), 1, 13, 14)
    },
    {
        scope:   scope,
        raw:     "(...x, y) => 1",
        error:   new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 5, 6)
    },
    {
        scope:   scope,
        raw:     "(x, ...y, z) => 1",
        error:   new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 8, 9)
    },
    {
        scope:   scope,
        raw:     "([...x, y]) => 1",
        error:   new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 12, 13)
    },
    {
        scope:   scope,
        raw:     "(...[...x, y]) => 1",
        error:   new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 9, 10)
    },
    {
        scope:   scope,
        raw:     "(...[{ ...x, y }]) => 1",
        error:   new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 11, 12)
    },
    {
        scope:   scope,
        raw:     "(...{ a, { b }}) => a + b",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "{" }), 1, 9, 10)
    },
    {
        scope:   scope,
        raw:     "(a, { b, x: { c: 1 } }) => a + b + c",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "=>" }), 1, 24, 25)
    },
    {
        scope:   scope,
        raw:     "(...{ a, ...{ b } }) => a",
        error:   new SyntaxError(Messages.restOperatorMustBeFollowedByAnIdentifierInDeclarationContexts, 1, 18, 19)
    },
    {
        scope:   scope,
        raw:     "({ ...{ a }, b }) => a",
        error:   new SyntaxError(Messages.restParameterMustBeLastFormalParameter, 1, 18, 19)
    },
    {
        scope:   scope,
        raw:     "(...a = []) => a",
        error:   new SyntaxError(Messages.restParameterMayNotHaveAdefaultInitializer, 1, 10, 11)
    },
    {
        scope:   scope,
        raw:     "(...[...a = 1]) => a",
        error:   new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 13, 14)
    },
    {
        scope:   scope,
        raw:     "([x, ...y = []]) => y",
        error:   new SyntaxError(Messages.invalidDestructuringAssignmentTarget, 1, 17, 18)
    },
    {
        scope:   scope,
        raw:     "(a, a) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 11, 12)
    },
    {
        scope:   scope,
        raw:     "(...[a, a]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 16, 17)
    },
    {
        scope:   scope,
        raw:     "(a, [a]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 13, 14)
    },
    {
        scope:   scope,
        raw:     "(a, [b, { b }]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 20, 21)
    },
    {
        scope:   scope,
        raw:     "(a, [b, { x: b }]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 23, 24)
    },
    {
        scope:   scope,
        raw:     "(a, [b, { x: { b } }]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 27, 28)
    },
    {
        scope:   scope,
        raw:     "(a, [b, { x: { c, c } }]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 30, 31)
    },
    {
        scope:   scope,
        raw:     "(a, [b, { x: { c, ...c } }]) => a",
        error:   new SyntaxError(Messages.duplicateParameterNameNotAllowedInThisContext, 1, 33, 34)
    },
    {
        scope:   scope,
        raw:     "x, y z",
        error:   new SyntaxError(format(Messages.unexpectedToken, { token: "z" }), 1, 5, 6)
    },
    {
        scope:   scope,
        raw:     "x || x = 1",
        error:   new ReferenceError(Messages.invalidLeftHandSideInAssignment)
    },
    {
        scope:   scope,
        raw:     "x || x => x",
        error:   new SyntaxError(Messages.malformedArrowFunctionParameterList, 1, 7, 8)
    },
];