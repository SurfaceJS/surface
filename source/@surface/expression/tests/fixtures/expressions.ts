import { Constructor, Indexer, Nullable } from "@surface/core";
import IExpression                        from "../../interfaces/expression";
import ArrayExpression                    from "../../internal/expressions/array-expression";
import AssignmentExpression               from "../../internal/expressions/assignment-expression";
import BinaryExpression                   from "../../internal/expressions/binary-expression" ;
import CallExpression                     from "../../internal/expressions/call-expression";
import ConditionalExpression              from "../../internal/expressions/conditional-expression";
import ConstantExpression                 from "../../internal/expressions/constant-expression";
import IdentifierExpression               from "../../internal/expressions/identifier-expression";
import LambdaExpression                   from "../../internal/expressions/lambda-expression";
import MemberExpression                   from "../../internal/expressions/member-expression";
import NewExpression                      from "../../internal/expressions/new-expression";
import ObjectExpression                   from "../../internal/expressions/object-expression";
import RegexExpression                    from "../../internal/expressions/regex-expression";
import TemplateExpression                 from "../../internal/expressions/template-expression";
import UnaryExpression                    from "../../internal/expressions/unary-expression";
import UpdateExpression                   from "../../internal/expressions/update-expression";
import SyntaxError                        from "../../syntax-error";

export type ExpressionFixtureSpec =
{
    context:  Indexer,
    raw:      string,
    toString: string,
    type:     Constructor<IExpression>,
    value:    Nullable<Object>,
};

export type InvalidExpressionFixtureSpec =
{
    context: Object,
    error:   Error,
    raw:     string,
};

const context =
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
    MyClass: class MyClass
    {
        public id:     number;
        public active: boolean;

        public constructor(id?: number, active?: boolean)
        {
            this.id     = id || 0;
            this.active = !!active;
        }
    },
    noop(value: unknown)
    {
        return value;
    }
};

// tslint:disable-next-line:no-any
export const validExpressions: Array<ExpressionFixtureSpec> =
[
    {
        context:  context,
        raw:      "[]",
        value:    [],
        toString: "[]",
        type:     ArrayExpression,
    },
    {
        context:  context,
        raw:      "[, 1, 2, , 3, ,]",
        value:    [undefined, 1, 2, undefined, 3, undefined,],
        toString: "[undefined, 1, 2, undefined, 3, undefined]",
        type:     ArrayExpression,
    },
    {
        context:  context,
        raw:      "[1, 'foo', true, { foo: 'bar' }]",
        value:    [1, "foo", true, { foo: "bar" }],
        toString: "[1, \"foo\", true, { \"foo\": \"bar\" }]",
        type:     ArrayExpression,
    },
    {
        context:  { one: 1, two: 2 },
        raw:      "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",
        value:    [1, "foo", true, { foo: 1 }, { bar: 2 }],
        toString: "[1, \"foo\", true, ...[{ \"foo\": one }, { \"bar\": two }]]",
        type:     ArrayExpression,
    },
    {
        context:  { factory: () => [1, 2, 3] },
        raw:      "[0, ...factory()]",
        value:    [0, 1, 2, 3],
        toString: "[0, ...factory()]",
        type:     ArrayExpression,
    },
    {
        context:  context,
        raw:      "this.value = 0",
        value:    0,
        toString: "this.value = 0",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value = this.value1 += 2",
        value:    2,
        toString: "this.value = this.value1 += 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value *= 2",
        value:    4,
        toString: "this.value *= 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value **= 2",
        value:    16,
        toString: "this.value **= 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value /= 2",
        value:    8,
        toString: "this.value /= 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value %= 2",
        value:    0,
        toString: "this.value %= 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value += 2",
        value:    2,
        toString: "this.value += 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value -= 1",
        value:    1,
        toString: "this.value -= 1",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value <<= 2",
        value:    4,
        toString: "this.value <<= 2",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value >>= 1",
        value:    2,
        toString: "this.value >>= 1",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value >>>= 1",
        value:    1,
        toString: "this.value >>>= 1",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value &= 1",
        value:    1,
        toString: "this.value &= 1",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value ^= 1",
        value:    0,
        toString: "this.value ^= 1",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "this.value |= 1",
        value:    1,
        toString: "this.value |= 1",
        type:     AssignmentExpression
    },
    {
        context:  context,
        raw:      "1 + 1",
        value:    2,
        toString: "1 + 1",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 - 1",
        value:    0,
        toString: "1 - 1",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "2 * 2",
        value:    4,
        toString: "2 * 2",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "4 / 2",
        value:    2,
        toString: "4 / 2",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "10 % 3",
        value:    1,
        toString: "10 % 3",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "true && false",
        value:    false,
        toString: "true && false",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "true || false",
        value:    true,
        toString: "true || false",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "false || true",
        value:    true,
        toString: "false || true",
        type:     BinaryExpression,
    },
    {
        context:  { this: { id: 1 } },
        raw:      "'id' in this",
        value:    true,
        toString: "\"id\" in this",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 == 1",
        value:    true,
        toString: "1 == 1",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 === 1",
        value:    true,
        toString: "1 === 1",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 != 1",
        value:    false,
        toString: "1 != 1",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 !== 1",
        value:    false,
        toString: "1 !== 1",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "({ }) instanceof { }.constructor",
        value:    true,
        toString: "({ }) instanceof { }.constructor",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 <= 0",
        value:    false,
        toString: "1 <= 0",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 >= 0",
        value:    true,
        toString: "1 >= 0",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 > 0",
        value:    true,
        toString: "1 > 0",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 < 0",
        value:    false,
        toString: "1 < 0",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 & 2",
        value:    0,
        toString: "1 & 2",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 | 2",
        value:    3,
        toString: "1 | 2",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "1 ^ 2",
        value:    3,
        toString: "1 ^ 2",
        type:     BinaryExpression,
    },
    {
        context:  context,
        raw:      "2 ** 2",
        value:    4,
        toString: "2 ** 2",
        type:     BinaryExpression
    },
    {
        context:  context,
        raw:      "0b1000 << 2",
        value:    0b100000,
        toString: "8 << 2",
        type:     BinaryExpression
    },
    {
        context:  context,
        raw:      "0b1000 >> 2",
        value:    0b10,
        toString: "8 >> 2",
        type:     BinaryExpression
    },
    {
        context:  context,
        raw:      "0b1000 >>> 2",
        value:    0b10,
        toString: "8 >>> 2",
        type:     BinaryExpression
    },
    {
        context:  context,
        raw:      "1 + 1 * 2 / 2",
        value:    2,
        toString: "1 + 1 * 2 / 2",
        type:     BinaryExpression
    },
    {
        context:  context,
        raw:      "noop(true)",
        value:    true,
        toString: "noop(true)",
        type:     CallExpression,
    },
    {
        context:  context,
        raw:      "this.getValue()",
        value:    42,
        toString: "this.getValue()",
        type:     CallExpression,
    },
    {
        context:  context,
        raw:      "this.increment(1)",
        value:    2,
        toString: "this.increment(1)",
        type:     CallExpression,
    },
    {
        context:  context,
        raw:      "this.greater(1, 2)",
        value:    false,
        toString: "this.greater(1, 2)",
        type:     CallExpression,
    },
    {
        context:  context,
        raw:      "this.greater(...[1, 2],)",
        value:    false,
        toString: "this.greater(...[1, 2])",
        type:     CallExpression,
    },
    {
        context:  context,
        raw:      "/test/.test(\"test\")",
        value:    true,
        toString: "/test/.test(\"test\")",
        type:     CallExpression
    },
    {
        context:  context,
        raw:      "/test/i.test(\"TEST\")",
        value:    true,
        toString: "/test/i.test(\"TEST\")",
        type:     CallExpression
    },
    {
        context:  context,
        raw:      "(true ? this.greater : this.lesser)(1, 2)",
        value:    false,
        toString: "(true ? this.greater : this.lesser)(1, 2)",
        type:     CallExpression
    },
    {
        context:  { greater: (a: number, b: number) => a == 1 && b == 2, factory: () => [1, 2] },
        raw:      "greater(...factory())",
        value:    true,
        toString: "greater(...factory())",
        type:     CallExpression
    },
    {
        context:  context,
        raw:      "1 > 2 ? \"greater\" : \"smaller\"",
        value:    "smaller",
        toString: "1 > 2 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression
    },
    {
        context:  context,
        raw:      "2 > 1 ? \"greater\" : \"smaller\"",
        value:    "greater",
        toString: "2 > 1 ? \"greater\" : \"smaller\"",
        type:     ConditionalExpression
    },
    {
        context:  context,
        raw:      "1",
        value:    1,
        toString: "1",
        type:     ConstantExpression,
    },
    {
        context:  context,
        raw:      "\"double quotes\"",
        value:    "double quotes",
        toString: "\"double quotes\"",
        type:     ConstantExpression,
    },
    {
        context:  context,
        raw:      "'single quotes'",
        value:    "single quotes",
        toString: "\"single quotes\"",
        type:     ConstantExpression,
    },
    {
        context:  context,
        raw:      "true",
        value:    true,
        toString: "true",
        type:     ConstantExpression,
    },
    {
        context:  context,
        raw:      "false",
        value:    false,
        toString: "false",
        type:     ConstantExpression,
    },
    {
        context:  context,
        raw:      "null",
        value:    null,
        toString: "null",
        type:     ConstantExpression,
    },
    {
        context:  context,
        raw:      "undefined",
        value:    undefined,
        toString: "undefined",
        type:     ConstantExpression,
    },
    {
        context:  { this: { id: 1 } },
        raw:      "this",
        value:    { id: 1 },
        toString: "this",
        type:     IdentifierExpression,
    },
    {
        context:  context,
        raw:      "() => undefined",
        value:    () => undefined,
        toString: "() => undefined",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(value) => value++",
        value:    (value: number) => value++,
        toString: "(value) => value++",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(a, b) => a + b",
        value:    (a: number, b: number) => a + b,
        toString: "(a, b) => a + b",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "([a]) => a",
        value:    ([a]: Array<string>) => a,
        toString: "([a]) => a",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(a, [b, c]) => a + b + c",
        value:    (a: number, [b, c]: Array<number>) => a + b + c,
        toString: "(a, [b, c]) => a + b + c",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(a, [b, [c]]) => a + b + c",
        value:    (a: number, [b, [c]]: [number, Array<number>]) => a + b + c,
        toString: "(a, [b, [c]]) => a + b + c",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "({ a }) => a",
        value:    ({ a }: { a: string }) => a,
        toString: "({ a }) => a",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(a, { b, x: { c } }) => a + b + c",
        value:    (a: number, { b, "x": { c } }: { b: number, x: { c: number } }) => a + b + c,
        toString: "(a, { b, \"x\": { c } }) => a + b + c",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(a, [b, [c]]) => a + b + c",
        value:    (a: number, [b, [c]]: [number, Array<number>]) => a + b + c,
        toString: "(a, [b, [c]]) => a + b + c",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "(...a) => a",
        value:    (...a: Array<number>) => a,
        toString: "(...a) => a",
        type:     LambdaExpression,
    },
    {
        context:  context,
        raw:      "this.new",
        value:    "new",
        toString: "this.new",
        type:     MemberExpression,
    },
    {
        context:  { this: { id: 1 } },
        raw:      "this.id",
        value:    1,
        toString: "this.id",
        type:     MemberExpression,
    },
    {
        context:  context,
        raw:      "this.increment",
        value:    context.this.increment,
        toString: "this.increment",
        type:     MemberExpression,
    },
    {
        context:  context,
        raw:      "this['increment']",
        value:    context.this.increment,
        toString: "this[\"increment\"]",
        type:     MemberExpression,
    },
    {
        context:  context,
        raw:      "this.getObject().value",
        value:    "Hello World!!!",
        toString: "this.getObject().value",
        type:     MemberExpression,
    },
    {
        context:  context,
        raw:      "new MyClass",
        value:    { id: 0, active: false },
        toString: "new MyClass()",
        type:     NewExpression,
    },
    {
        context:  { ...context, factory: () => [1, true]},
        raw:      "new MyClass(...factory())",
        value:    { id: 1, active: true },
        toString: "new MyClass(...factory())",
        type:     NewExpression,
    },
    {
        context:  context,
        raw:      "{ }",
        value:    { },
        toString: "{ }",
        type:     ObjectExpression,
    },
    {
        context: context,
        raw:      "{ 1: 1 }",
        value:    { 1: 1 },
        toString: "{ \"1\": 1 }",
        type:     ObjectExpression,
    },
    {
        context:  context,
        raw:      "{ new: 1 }",
        value:    { new: 1 },
        toString: "{ \"new\": 1 }",
        type:     ObjectExpression,
    },
    {
        context:  context,
        raw:      "{ foo: 1, \"bar\": [1, ...[2, 3]], [{id: 1}.id]: 1 }",
        value:    { foo: 1, "bar": [1, 2, 3], [{id: 1}.id]: 1 },
        toString: "{ \"foo\": 1, \"bar\": [1, ...[2, 3]], [{ \"id\": 1 }.id]: 1 }",
        type:     ObjectExpression,
    },
    {
        context:  context,
        raw:      "{ foo: 'bar', ...{ id: 2, value: 3 } }",
        value:    { foo: "bar", id: 2, value: 3 },
        toString: "{ \"foo\": \"bar\", ...{ \"id\": 2, \"value\": 3 } }",
        type:     ObjectExpression,
    },
    {
        context:  context,
        raw:      "{ foo: 'bar', ...[1, 2] }",
        value:    { 0: 1, 1: 2, foo: "bar" },
        toString: "{ \"foo\": \"bar\", ...[1, 2] }",
        type:     ObjectExpression,
    },
    {
        context:  { id: 1 },
        raw:      "{ id }",
        value:    { id: 1 },
        toString: "{ id }",
        type:     ObjectExpression,
    },
    {
        context:  { id: 1 },
        raw:      "{ [id]: 2 }",
        value:    { 1: 2 },
        toString: "{ [id]: 2 }",
        type:     ObjectExpression,
    },
    {
        context:  { factory: () => ({ id: 1 }) },
        raw:      "{ foo: 1, ...factory() }",
        value:    { foo: 1, id: 1 },
        toString: "{ \"foo\": 1, ...factory() }",
        type:     ObjectExpression,
    },
    {
        context:  context,
        raw:      "/test/",
        value:    /test/,
        toString: "/test/",
        type:     RegexExpression,
    },
    {
        context:  context,
        raw:      "/test/ig",
        value:    /test/ig,
        toString: "/test/ig",
        type:     RegexExpression,
    },
    {
        context:  context,
        raw:      "`The id is: ${this.id}`",
        value:    "The id is: 1",
        toString: "`The id is: ${this.id}`",
        type:     TemplateExpression
    },
    {
        context:  context,
        raw:      "+1",
        value:    1,
        toString: "+1",
        type:     UnaryExpression
    },
    {
        context:  context,
        raw:      "-1",
        value:    -1,
        toString: "-1",
        type:     UnaryExpression
    },
    {
        context:  context,
        raw:      "~1",
        value:    -2,
        toString: "~1",
        type:     UnaryExpression
    },
    {
        context:  context,
        raw:      "!true",
        value:    false,
        toString: "!true",
        type:     UnaryExpression
    },
    {
        context:  context,
        raw:      "typeof 1",
        value:    "number",
        toString: "typeof 1",
        type:     UnaryExpression
    },
    {
        context:  { value: 1 },
        raw:      "++value",
        value:    2,
        toString: "++value",
        type:     UpdateExpression
    },
    {
        context: { 識別子: 1 },
        raw:      "識別子--",
        value:    1,
        toString: "識別子--",
        type:     UpdateExpression
    },
    {
        context:  { this: { value: 1 } },
        raw:      "++this.value",
        value:    2,
        toString: "++this.value",
        type:     UpdateExpression
    },
    {
        context:  { this: { value: 1 } },
        raw:      "--this.value",
        value:    0,
        toString: "--this.value",
        type:     UpdateExpression
    },
    {
        context:  { this: { value: 1 } },
        raw:      "this.value++",
        value:    1,
        toString: "this.value++",
        type:     UpdateExpression
    },
    {
        context:  { this: { value: 1 } },
        raw:      "this.value--",
        value:    1,
        toString: "this.value--",
        type:     UpdateExpression
    },
];

export const invalidExpressions: Array<InvalidExpressionFixtureSpec> =
[
    {
        context: context,
        raw:     "foo",
        error:   new Error("The identifier foo does not exist in this context")
    },
    {
        context: context,
        raw:     "this.''",
        error:   new SyntaxError("Unexpected string", 1, 5, 6)
    },
    {
        context: context,
        raw:     "this.1",
        error:   new SyntaxError("Unexpected number", 1, 4, 5)
    },
    {
        context: context,
        raw:     ".",
        error:   new SyntaxError("Unexpected token .", 1, 0, 1)
    },
    {
        context: context,
        raw:     "if",
        error:   new SyntaxError("Unexpected token if", 1, 0, 1)
    },
    {
        context: context,
        raw:     "this.?",
        error:   new SyntaxError("Unexpected token ?", 1, 5, 6)
    },
    {
        context: context,
        raw:     "this if",
        error:   new SyntaxError("Unexpected token if", 1, 5, 6)
    },
    {
        context: context,
        raw:     "{ (foo) }",
        error:   new SyntaxError("Unexpected token (", 1, 2, 3)
    },
    {
        context: context,
        raw:     "{ new }",
        error:   new SyntaxError("Unexpected token }", 1, 6, 7)
    },
    {
        context: context,
        raw:     "1 + if",
        error:   new SyntaxError("Unexpected token if", 1, 4, 5)
    },
    {
        context: context,
        raw:     "[ ? ]",
        error:   new SyntaxError("Unexpected token ?", 1, 2, 3)
    },
    {
        context: context,
        raw:     "",
        error:   new SyntaxError("Unexpected end of expression", 1, 0, 1)
    },
    {
        context: context,
        raw:     "1 < 2 ? true .",
        error:   new SyntaxError("Unexpected end of expression", 1, 14, 15)
    },
    {
        context: context,
        raw:     "([x.y]) => 1",
        error:   new SyntaxError("Unexpected token =>", 1, 8, 9)
    },
    {
        context: context,
        raw:     "({ x: 1 }) => 1",
        error:   new SyntaxError("Unexpected token =>", 1, 11, 12)
    },
    {
        context: context,
        raw:     "([{ x: 1 }]) => 1",
        error:   new SyntaxError("Unexpected token =>", 1, 13, 14)
    },
    {
        context: context,
        raw:     "(a, { b, x: { c: 1 } }) => a + b + c",
        error:   new SyntaxError("Unexpected token =>", 0, 0, 0) // Todo: Review indexes
    },
];