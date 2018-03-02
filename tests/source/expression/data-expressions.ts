import IExpression           from "@surface/expression/interfaces/expression";
import ArrayExpression       from "@surface/expression/internal/expressions/array-expression";
import BinaryExpression      from "@surface/expression/internal/expressions/binary-expression" ;
import CallExpression        from "@surface/expression/internal/expressions/call-expression";
import ConditionalExpression from "@surface/expression/internal/expressions/conditional-expression";
import ConstantExpression    from "@surface/expression/internal/expressions/constant-expression";
import IdentifierExpression  from "@surface/expression/internal/expressions/identifier-expression";
import MemberExpression      from "@surface/expression/internal/expressions/member-expression";
import ObjectExpression      from "@surface/expression/internal/expressions/object-expression";
import RegexExpression       from "@surface/expression/internal/expressions/regex-expression";
import TemplateExpression    from "@surface/expression/internal/expressions/template-expression";
import UnaryExpression       from "@surface/expression/internal/expressions/unary-expression";
import UpdateExpression      from "@surface/expression/internal/expressions/update-expression";

import { Constructor } from "@surface/enumerable/node_modules/@surface/types";

export const context =
{
    id:    1,
    zero:  { id: 0 },
    one:   { id: 1, getValue:  () => 1 },
    two:   { id: 2, increment: (value: number) => ++value },
    three: { id: 3, greater:   (left: number, right: number) => left > right },
    four:  { id: 4, getObject: () => ({ value: "Hello World!!!" }) },
};

// tslint:disable-next-line:no-any
export const validExpressions: Array<{ raw: string, value: any, type: Constructor<IExpression> }> =
[
    { raw: "1",                                                     value: 1,                                                            type: ConstantExpression },
    { raw: "\"double quotes\"",                                     value: "double quotes",                                              type: ConstantExpression },
    { raw: "'single quotes'",                                       value: "single quotes",                                              type: ConstantExpression },
    { raw: "true",                                                  value: true,                                                         type: ConstantExpression },
    { raw: "false",                                                 value: false,                                                        type: ConstantExpression },
    { raw: "null",                                                  value: null,                                                         type: ConstantExpression },
    { raw: "undefined",                                             value: undefined,                                                    type: ConstantExpression },
    { raw: "{ }",                                                   value: { },                                                          type: ObjectExpression },
    { raw: "{ foo: 1, \"bar\": [1, ...[2, 3]], [{id: 1}.id]: 1 }",  value: { foo: 1, "bar": [1, 2, 3], [{id: 1}.id]: 1 },                type: ObjectExpression },
    { raw: "{ foo: 'bar', ...{ id: 2, value: 3 }}",                 value: { foo: "bar", id: 2, value: 3 },                              type: ObjectExpression },
    { raw: "{ foo: 'bar', ...[1, 2]}",                              value: { 0: 1, 1: 2, foo: "bar" },                                   type: ObjectExpression },
    { raw: "[]",                                                    value: [],                                                           type: ArrayExpression },
    { raw: "[1, 'foo', true, { foo: 'bar' }]",                      value: [1, "foo", true, { foo: "bar" }],                             type: ArrayExpression },
    { raw: "[1, 'foo', true, ...[{ foo: one }, { bar: two }]]",     value: [1, "foo", true, { foo: context.one }, { bar: context.two }], type: ArrayExpression },
    { raw: "/test/",                                                value: /test/,                                                       type: RegexExpression },
    { raw: "/test/ig",                                              value: /test/ig,                                                     type: RegexExpression },
    { raw: "1 + 1",                                                 value: 2,                                                            type: BinaryExpression },
    { raw: "1 - 1",                                                 value: 0,                                                            type: BinaryExpression },
    { raw: "2 * 2",                                                 value: 4,                                                            type: BinaryExpression },
    { raw: "4 / 2",                                                 value: 2,                                                            type: BinaryExpression },
    { raw: "10 % 3",                                                value: 1,                                                            type: BinaryExpression },
    { raw: "true && false",                                         value: false,                                                        type: BinaryExpression },
    { raw: "true || false",                                         value: true,                                                         type: BinaryExpression },
    { raw: "1 == 1",                                                value: true,                                                         type: BinaryExpression },
    { raw: "1 === 1",                                               value: true,                                                         type: BinaryExpression },
    { raw: "1 != 1",                                                value: false,                                                        type: BinaryExpression },
    { raw: "1 !== 1",                                               value: false,                                                        type: BinaryExpression },
    { raw: "({ }) instanceof ({ }).constructor",                    value: true,                                                         type: BinaryExpression },
    { raw: "1 <= 0",                                                value: false,                                                        type: BinaryExpression },
    { raw: "1 >= 0",                                                value: true,                                                         type: BinaryExpression },
    { raw: "1 > 0",                                                 value: true,                                                         type: BinaryExpression },
    { raw: "1 < 0",                                                 value: false,                                                        type: BinaryExpression },
    { raw: "1 & 2",                                                 value: 0,                                                            type: BinaryExpression },
    { raw: "1 | 2",                                                 value: 3,                                                            type: BinaryExpression },
    { raw: "1 ^ 2",                                                 value: 3,                                                            type: BinaryExpression },
    { raw: "2 ** 2",                                                value: 4,                                                            type: BinaryExpression },
    { raw: "0b1000 << 2",                                           value: 0b100000,                                                     type: BinaryExpression },
    { raw: "0b1000 >> 2",                                           value: 0b10,                                                         type: BinaryExpression },
    { raw: "0b1000 >>> 2",                                          value: 0b10,                                                         type: BinaryExpression },
    { raw: "+1",                                                    value: 1,                                                            type: UnaryExpression },
    { raw: "-1",                                                    value: -1,                                                           type: UnaryExpression },
    { raw: "~1",                                                    value: -2,                                                           type: UnaryExpression },
    { raw: "!true",                                                 value: false,                                                        type: UnaryExpression },
    { raw: "typeof 1",                                              value: "number",                                                     type: UnaryExpression },
    { raw: "++id",                                                  value: 2,                                                            type: UpdateExpression },
    { raw: "++one.id",                                              value: 2,                                                            type: UpdateExpression },
    { raw: "--two.id",                                              value: 1,                                                            type: UpdateExpression },
    { raw: "three.id++",                                            value: 3,                                                            type: UpdateExpression },
    { raw: "four.id--",                                             value: 4,                                                            type: UpdateExpression },
    { raw: "one",                                                   value: context.one,                                                  type: IdentifierExpression },
    { raw: "two",                                                   value: context.two,                                                  type: IdentifierExpression },
    { raw: "three",                                                 value: context.three,                                                type: IdentifierExpression },
    { raw: "four",                                                  value: context.four,                                                 type: IdentifierExpression },
    { raw: "one.getValue",                                          value: context.one.getValue,                                         type: MemberExpression },
    { raw: "two.increment",                                         value: context.two.increment,                                        type: MemberExpression },
    { raw: "three.greater",                                         value: context.three.greater,                                        type: MemberExpression },
    { raw: "four.getObject",                                        value: context.four.getObject,                                       type: MemberExpression },
    { raw: "one.getValue()",                                        value: 1,                                                            type: CallExpression },
    { raw: "two.increment(1)",                                      value: 2,                                                            type: CallExpression },
    { raw: "three.greater(1, 2)",                                   value: false,                                                        type: CallExpression },
    { raw: "four.getObject().value",                                value: "Hello World!!!",                                             type: MemberExpression },
    { raw: "/test/.test('test')",                                   value: true,                                                         type: CallExpression },
    { raw: "/test/i.test('TEST')",                                  value: true,                                                         type: CallExpression },
    { raw: "`The zero.id is: ${zero.id}`",                          value: "The zero.id is: 0",                                          type: TemplateExpression },
    { raw: "1 > 2 ? 'greater' : 'smaller'",                         value: "smaller",                                                    type: ConditionalExpression },
];