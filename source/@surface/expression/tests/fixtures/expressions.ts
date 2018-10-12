import IExpression           from "../../interfaces/expression";
import ArrayExpression       from "../../internal/expressions/array-expression";
import BinaryExpression      from "../../internal/expressions/binary-expression" ;
import CallExpression        from "../../internal/expressions/call-expression";
import ConditionalExpression from "../../internal/expressions/conditional-expression";
import ConstantExpression    from "../../internal/expressions/constant-expression";
import IdentifierExpression  from "../../internal/expressions/identifier-expression";
import MemberExpression      from "../../internal/expressions/member-expression";
import ObjectExpression      from "../../internal/expressions/object-expression";
import RegexExpression       from "../../internal/expressions/regex-expression";
import TemplateExpression    from "../../internal/expressions/template-expression";
import UnaryExpression       from "../../internal/expressions/unary-expression";
import UpdateExpression      from "../../internal/expressions/update-expression";
import SyntaxError           from "../../syntax-error";

import { Constructor, Nullable } from "@surface/core";

export type ExpressionFixtureSpec        = { raw: string, value: Nullable<Object>, type: Constructor<IExpression>, context: Object };
export type InvalidExpressionFixtureSpec = { raw: string, error: Error, context: Object };

const context =
{
    this:
    {
        id:        1,
        greater:   (left: number, right: number) => left > right,
        increment: (value: number) => ++value,
        getObject: () => ({ value: "Hello World!!!" }),
        getValue:  () => 42
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
        context: context,
        raw:     "1",
        value:   1,
        type:    ConstantExpression,
    },
    {
        context: context,
        raw:     "\"double quotes\"",
        value:   "double quotes",
        type:    ConstantExpression,
    },
    {
        context: context,
        raw:     "'single quotes'",
        value:   "single quotes",
        type:    ConstantExpression,
    },
    {
        context: context,
        raw:     "true",
        value:   true,
        type:    ConstantExpression,
    },
    {
        context: context,
        raw:    "false",
        value:  false,
        type:   ConstantExpression,
    },
    {
        context: context,
        raw:     "null",
        value:   null,
        type:    ConstantExpression,
    },
    {
        context: context,
        raw:     "undefined",
        value:   undefined,
        type:    ConstantExpression,
    },
    {
        context: context,
        raw:     "{ }",
        value:   { },
        type:    ObjectExpression,
    },
    {
        context: context,
        raw:     "noop(true)",
        value:   true,
        type:    CallExpression,
    },
    {
        context: context,
        raw:     "{ foo: 1, \"bar\": [1, ...[2, 3]], [{id: 1}.id]: 1 }",
        value:   { foo: 1, "bar": [1, 2, 3], [{id: 1}.id]: 1 },
        type:    ObjectExpression,
    },
    {
        context: context,
        raw:     "{ foo: 'bar', ...{ id: 2, value: 3 }}",
        value:   { foo: "bar", id: 2, value: 3 },
        type:    ObjectExpression,
    },
    {
        context: context,
        raw:     "{ foo: 'bar', ...[1, 2]}",
        value:   { 0: 1, 1: 2, foo: "bar" },
        type:    ObjectExpression,
    },
    {
        context: { id: 1 },
        raw:     "{ id }",
        value:   { id: 1 },
        type:    ObjectExpression,
    },
    {
        context: { id: 1 },
        raw:     "{ [id]: 2 }",
        value:   { 1: 2 },
        type:    ObjectExpression,
    },
    {
        context: context,
        raw:     "[]",
        value:   [],
        type:    ArrayExpression,
    },
    {
        context: context,
        raw:     "[, 1, 2, , 3, ,]",
        value:   [undefined, 1, 2, undefined, 3, undefined,],
        type:    ArrayExpression,
    },
    {
        context: context,
        raw:     "[1, 'foo', true, { foo: 'bar' }]",
        value:   [1, "foo", true, { foo: "bar" }],
        type:    ArrayExpression,
    },
    {
        context: { one: 1, two: 2 },
        raw:     "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",
        value:   [1, "foo", true, { foo: 1 }, { bar: 2 }],
        type:    ArrayExpression,
    },
    {
        context: context,
        raw:     "/test/",
        value:   /test/,
        type:    RegexExpression,
    },
    {
        context: context,
        raw:     "/test/ig",
        value:   /test/ig,
        type:    RegexExpression,
    },
    {
        context: context,
        raw:     "1 + 1",
        value:   2,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 - 1",
        value:   0,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "2 * 2",
        value:   4,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "4 / 2",
        value:   2,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "10 % 3",
        value:   1,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "true && false",
        value:   false,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "true || false",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "false || true",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: { this: { id: 1 } },
        raw:     "'id' in this",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 == 1",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 === 1",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 != 1",
        value:   false,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 !== 1",
        value:   false,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "({ }) instanceof ({ }).constructor",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 <= 0",
        value:   false,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 >= 0",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 > 0",
        value:   true,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 < 0",
        value:   false,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 & 2",
        value:   0,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 | 2",
        value:   3,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "1 ^ 2",
        value:   3,
        type:    BinaryExpression,
    },
    {
        context: context,
        raw:     "2 ** 2",
        value:   4,
        type:    BinaryExpression
    },
    {
        context: context,
        raw:     "0b1000 << 2",
        value:   0b100000,
        type:    BinaryExpression
    },
    {
        context: context,
        raw:     "0b1000 >> 2",
        value:   0b10,
        type:    BinaryExpression
    },
    {
        context: context,
        raw:     "0b1000 >>> 2",
        value:   0b10,
        type:    BinaryExpression
    },
    {
        context: context,
        raw:     "1 + 1 * 2 / 2",
        value:   2,
        type:    BinaryExpression
    },
    {
        context: context,
        raw:     "+1",
        value:   1,
        type:    UnaryExpression
    },
    {
        context: context,
        raw:     "-1",
        value:   -1,
        type:    UnaryExpression
    },
    {
        context: context,
        raw:     "~1",
        value:   -2,
        type:    UnaryExpression
    },
    {
        context: context,
        raw:     "!true",
        value:   false,
        type:    UnaryExpression
    },
    {
        context: context,
        raw:     "typeof 1",
        value:   "number",
        type:    UnaryExpression
    },
    {
        context: { value: 1 },
        raw:     "++value",
        value:   2,
        type:    UpdateExpression
    },
    {
        context: { 識別子: 1 },
        raw:     "識別子--",
        value:   1,
        type:    UpdateExpression
    },
    {
        context: { this: { value: 1 } },
        raw:     "++this.value",
        value:   2,
        type:    UpdateExpression
    },
    {
        context: { this: { value: 1 } },
        raw:     "--this.value",
        value:   0,
        type:    UpdateExpression
    },
    {
        context: { this: { value: 1 } },
        raw:     "this.value++",
        value:   1,
        type:    UpdateExpression
    },
    {
        context: { this: { value: 1 } },
        raw:     "this.value--",
        value:   1,
        type:    UpdateExpression
    },
    {
        context: { this: { id: 1 } },
        raw:     "this",
        value:   { id: 1 },
        type:    IdentifierExpression,
    },
    {
        context: { this: { id: 1 } },
        raw:     "this.id",
        value:   1,
        type:    MemberExpression,
    },
    {
        context: context,
        raw:     "this.increment",
        value:   context.this.increment,
        type:    MemberExpression,
    },
    {
        context: context,
        raw:     "this['increment']",
        value:   context.this.increment,
        type:    MemberExpression,
    },
    {
        context: context,
        raw:     "this.getValue()",
        value:   42,
        type:    CallExpression,
    },
    {
        context: context,
        raw:     "this.increment(1)",
        value:   2,
        type:    CallExpression,
    },
    {
        context: context,
        raw:     "this.greater(1, 2)",
        value:   false,
        type:    CallExpression,
    },
    {
        context: context,
        raw:     "this.greater(...[1, 2],)",
        value:   false,
        type:    CallExpression,
    },
    {
        context: context,
        raw:     "this.getObject().value",
        value:   "Hello World!!!",
        type:    MemberExpression,
    },
    {
        context: context,
        raw:     "/test/.test('test')",
        value:   true,
        type:    CallExpression
    },
    {
        context: context,
        raw:     "/test/i.test('TEST')",
        value:   true,
        type:    CallExpression
    },
    {
        context: context,
        raw:     "`The id is: ${this.id}`",
        value:   "The id is: 1",
        type:    TemplateExpression
    },
    {
        context: context,
        raw:     "1 > 2 ? 'greater' : 'smaller'",
        value:   "smaller",
        type:    ConditionalExpression
    },
    {
        context: context,
        raw:     "2 > 1 ? 'greater' : 'smaller'",
        value:   "greater",
        type:    ConditionalExpression
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
        error:   new SyntaxError("Unexpected token if.", 1, 0, 1)
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
        error:   new SyntaxError("Unexpected token new", 1, 2, 3)
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
];