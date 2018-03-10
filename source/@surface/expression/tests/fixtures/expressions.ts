import ArrayExpression       from "../../internal/expressions/array-expression";
import BinaryExpression      from "../../internal/expressions/binary-expression" ;
import CallExpression        from "../../internal/expressions/call-expression";
import ConditionalExpression from "../../internal/expressions/conditional-expression";
import ConstantExpression    from "../../internal/expressions/constant-expression";
import IExpression           from "../../interfaces/expression";
import IdentifierExpression  from "../../internal/expressions/identifier-expression";
import MemberExpression      from "../../internal/expressions/member-expression";
import ObjectExpression      from "../../internal/expressions/object-expression";
import RegexExpression       from "../../internal/expressions/regex-expression";
import SyntaxError           from "../../internal/syntax-error";
import TemplateExpression    from "../../internal/expressions/template-expression";
import UnaryExpression       from "../../internal/expressions/unary-expression";
import UpdateExpression      from "../../internal/expressions/update-expression";

import { Constructor, Nullable } from "@surface/types";

type ExpressionFixture        = { raw: string, value: Nullable<Object>, type: Constructor<IExpression> };
type InvalidExpressionFixture = { raw: string, error: Error };

export const context =
{
    this:  { },
    id:    1,
    識別子: 1,
    zero:  { id: 0 },
    one:   { id: 1, getValue:  () => 1 },
    two:   { id: 2, increment: (value: number) => ++value },
    three: { id: 3, greater:   (left: number, right: number) => left > right },
    four:  { id: 4, getObject: () => ({ value: "Hello World!!!" }) },
};

// tslint:disable-next-line:no-any
export const validExpressions: Array<ExpressionFixture> =
[
    {
        raw:   "1",
        value: 1,
        type:  ConstantExpression
    },
    {
        raw:   "\"double quotes\"",
        value: "double quotes",
        type:  ConstantExpression
    },
    {
        raw:   "'single quotes'",
        value: "single quotes",
        type:  ConstantExpression
    },
    {
        raw:   "true",
        value: true,
        type:  ConstantExpression
    },
    {
        raw:    "false",
        value: false,
        type:  ConstantExpression
    },
    {
        raw:   "null",
        value: null,
        type:  ConstantExpression
    },
    {
        raw:   "undefined",
        value: undefined,
        type:  ConstantExpression
    },
    {
        raw:   "{ }",
        value: { },
        type:  ObjectExpression
    },
    {
        raw:   "{ foo: 1, \"bar\": [1, ...[2, 3]], [{id: 1}.id]: 1 }",
        value: { foo: 1, "bar": [1, 2, 3], [{id: 1}.id]: 1 },
        type:  ObjectExpression
    },
    {
        raw:   "{ foo: 'bar', ...{ id: 2, value: 3 }}",
        value: { foo: "bar", id: 2, value: 3 },
        type:  ObjectExpression
    },
    {
        raw:   "{ foo: 'bar', ...[1, 2]}",
        value: { 0: 1, 1: 2, foo: "bar" },
        type:  ObjectExpression
    },
    {
        raw:   "{ id }",
        value: { id: 1 },
        type:  ObjectExpression
    },
    {
        raw:   "{ [id]: 2 }",
        value: { 1: 2 },
        type:  ObjectExpression
    },
    {
        raw:   "[]",
        value: [],
        type:  ArrayExpression
    },
    {
        raw:   "[, 1, 2, , 3, ,]",
        value: [undefined, 1, 2, undefined, 3, undefined,],
        type:  ArrayExpression
    },
    {
        raw:   "[1, 'foo', true, { foo: 'bar' }]",
        value: [1, "foo", true, { foo: "bar" }],
        type:  ArrayExpression
    },
    {
        raw:   "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",
        value: [1, "foo", true, { foo: context.one }, { bar: context.two }],
        type:  ArrayExpression
    },
    {
        raw:   "/test/",
        value: /test/,
        type:  RegexExpression
    },
    {
        raw:   "/test/ig",
        value: /test/ig,
        type:  RegexExpression
    },
    {
        raw:   "1 + 1",
        value: 2,
        type:  BinaryExpression
    },
    {
        raw:   "1 - 1",
        value: 0,
        type:  BinaryExpression
    },
    {
        raw:   "2 * 2",
        value: 4,
        type:  BinaryExpression
    },
    {
        raw:   "4 / 2",
        value: 2,
        type:  BinaryExpression
    },
    {
        raw:   "10 % 3",
        value: 1,
        type:  BinaryExpression
    },
    {
        raw:   "true && false",
        value: false,
        type:  BinaryExpression
    },
    {
        raw:   "true || false",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "false || true",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "'id' in one",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "1 == 1",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "1 === 1",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "1 != 1",
        value: false,
        type:  BinaryExpression
    },
    {
        raw:   "1 !== 1",
        value: false,
        type:  BinaryExpression
    },
    {
        raw:   "({ }) instanceof ({ }).constructor",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "1 <= 0",
        value: false,
        type:  BinaryExpression
    },
    {
        raw:   "1 >= 0",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "1 > 0",
        value: true,
        type:  BinaryExpression
    },
    {
        raw:   "1 < 0",
        value: false,
        type:  BinaryExpression
    },
    {
        raw:   "1 & 2",
        value: 0,
        type:  BinaryExpression
    },
    {
        raw:   "1 | 2",
        value: 3,
        type:  BinaryExpression
    },
    {
        raw:   "1 ^ 2",
        value: 3,
        type:  BinaryExpression
    },
    {
        raw:   "2 ** 2",
        value: 4,
        type:  BinaryExpression
    },
    {
        raw:   "0b1000 << 2",
        value: 0b100000,
        type:  BinaryExpression
    },
    {
        raw:   "0b1000 >> 2",
        value: 0b10,
        type:  BinaryExpression
    },
    {
        raw:   "0b1000 >>> 2",
        value: 0b10,
        type:  BinaryExpression
    },
    {
        raw:   "1 + 1 * 2 / 2",
        value: 2,
        type:  BinaryExpression
    },
    {
        raw:   "+1",
        value: 1,
        type:  UnaryExpression
    },
    {
        raw:   "-1",
        value: -1,
        type:  UnaryExpression
    },
    {
        raw:   "~1",
        value: -2,
        type:  UnaryExpression
    },
    {
        raw:   "!true",
        value: false,
        type:  UnaryExpression
    },
    {
        raw:   "typeof 1",
        value: "number",
        type:  UnaryExpression
    },
    {
        raw:   "++id",
        value: 2,
        type:  UpdateExpression
    },
    {
        raw:   "識別子--",
        value: 1,
        type:  UpdateExpression
    },
    {
        raw:   "++one.id",
        value: 2,
        type:  UpdateExpression
    },
    {
        raw:   "--two.id",
        value: 1,
        type:  UpdateExpression
    },
    {
        raw:   "three.id++",
        value: 3,
        type:  UpdateExpression
    },
    {
        raw:   "four.id--",
        value: 4,
        type:  UpdateExpression
    },
    {
        raw:   "this",
        value: context.this,
        type:  IdentifierExpression
    },
    {
        raw:   "one",
        value: context.one,
        type:  IdentifierExpression
    },
    {
        raw:   "two",
        value: context.two,
        type:  IdentifierExpression
    },
    {
        raw:   "three",
        value: context.three,
        type:  IdentifierExpression
    },
    {
        raw:   "four",
        value: context.four,
        type:  IdentifierExpression
    },
    {
        raw:   "one.getValue",
        value: context.one.getValue,
        type:  MemberExpression
    },
    {
        raw:   "two.increment",
        value: context.two.increment,
        type:  MemberExpression
    },
    {
        raw:   "three.greater",
        value: context.three.greater,
        type:  MemberExpression
    },
    {
        raw:   "four.getObject",
        value: context.four.getObject,
        type:  MemberExpression
    },
    {
        raw:   "four['getObject']",
        value: context.four.getObject,
        type:  MemberExpression
    },
    {
        raw:   "one.getValue()",
        value: 1,
        type:  CallExpression
    },
    {
        raw:   "two.increment(1)",
        value: 2,
        type:  CallExpression
    },
    {
        raw:   "three.greater(1, 2)",
        value: false,
        type:  CallExpression
    },
    {
        raw:   "three.greater(...[1, 2],)",
        value: false,
        type:  CallExpression
    },
    {
        raw:   "four.getObject().value",
        value: "Hello World!!!",
        type:  MemberExpression
    },
    {
        raw:   "/test/.test('test')",
        value: true,
        type:  CallExpression
    },
    {
        raw:   "/test/i.test('TEST')",
        value: true,
        type:  CallExpression
    },
    {
        raw:   "`The zero.id is: ${zero.id}`",
        value: "The zero.id is: 0",
        type:  TemplateExpression
    },
    {
        raw:   "1 > 2 ? 'greater' : 'smaller'",
        value: "smaller",
        type:  ConditionalExpression
    },
    {
        raw:   "2 > 1 ? 'greater' : 'smaller'",
        value: "greater",
        type:  ConditionalExpression
    },
];

export const invalidExpressions: Array<InvalidExpressionFixture> =
[
    {
        raw:   "foo",
        error: new Error("The identifier foo does not exist in this context")
    },
    {
        raw:   "one.''",
        error: new SyntaxError("Unexpected string", 1, 4, 5)
    },
    {
        raw:   "one.1",
        error: new SyntaxError("Unexpected number", 1, 3, 4)
    },
    {
        raw:   ".",
        error: new SyntaxError("Unexpected token .", 1, 0, 1)
    },
    {
        raw:   "if",
        error: new SyntaxError("Unexpected token if.", 1, 0, 1)
    },
    {
        raw:   "one.?",
        error: new SyntaxError("Unexpected token ?", 1, 4, 5)
    },
    {
        raw:   "one if",
        error: new SyntaxError("Unexpected token if", 1, 4, 5)
    },
    {
        raw:   "{ (foo) }",
        error: new SyntaxError("Unexpected token (", 1, 2, 3)
    },
    {
        raw:   "{ new }",
        error: new SyntaxError("Unexpected token new", 1, 2, 3)
    },
    {
        raw:   "1 + if",
        error: new SyntaxError("Unexpected end of if", 1, 4, 5)
    },
    {
        raw:   "1 + if",
        error: new SyntaxError("Unexpected end of if", 1, 4, 5)
    },
    {
        raw:   "[ ? ]",
        error: new SyntaxError("Unexpected token ?", 1, 2, 3)
    },
    {
        raw:   "",
        error: new SyntaxError("Unexpected end of expression", 1, 0, 1)
    },
    {
        raw:   "1 < 2 ? true .",
        error: new SyntaxError("Unexpected end of expression", 1, 14, 15)
    },
];