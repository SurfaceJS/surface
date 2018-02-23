import { expect } from "chai";

import Messages    from "@surface/custom-element/internal/messages";
import Scanner     from "@surface/custom-element/internal/scanner";
import SyntaxError from "@surface/custom-element/internal/syntax-error";
import Token       from "@surface/custom-element/internal/token";

debugger;
const validTokens =
[
    { raw: "_identifier",           value: "_identifier",         type: Token.Identifier },
    { raw: "identifier",            value: "identifier",          type: Token.Identifier },
    { raw: "identifier\u{123}",     value: "identifier\u{123}",   type: Token.Identifier },
    { raw: "\"string\"",            value: "string",              type: Token.StringLiteral },
    { raw: "'string'",              value: "string",              type: Token.StringLiteral },
    { raw: "\"quotes '`\"",         value: "quotes '`",           type: Token.StringLiteral },
    { raw: "'quotes \"`'",          value: "quotes \"`",          type: Token.StringLiteral },
    { raw: "`string`",              value: "string",              type: Token.Template },
    { raw: "`quotes \"'`",          value: "quotes \"'",          type: Token.Template },
    { raw: "123",                   value: 123,                   type: Token.NumericLiteral },
    { raw: "123.123",               value: 123.123,               type: Token.NumericLiteral },
    { raw: ".123",                  value: 0.123,                 type: Token.NumericLiteral },
    { raw: "123_123",               value: 123123,                type: Token.NumericLiteral },
    { raw: "123_123.123",           value: 123123.123,            type: Token.NumericLiteral },
    { raw: ".123_123",              value: 0.123123,              type: Token.NumericLiteral },
    { raw: "4.722366482869645e+21", value: 4.722366482869645e+21, type: Token.NumericLiteral },
    { raw: "0x0123456789abcdef",    value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0X0123456789abcdef",    value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0x0123456789ABCDEF",    value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0X0123456789ABCDEF",    value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0x0123456789_abcdef",   value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0X0123456789_abcdef",   value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0x0123456789_ABCDEF",   value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0X0123456789_ABCDEF",   value: 81985529216486900,     type: Token.NumericLiteral },
    { raw: "0b0101",                value: 5,                     type: Token.NumericLiteral },
    { raw: "0B0101",                value: 5,                     type: Token.NumericLiteral },
    { raw: "0b0101_0101",           value: 85,                    type: Token.NumericLiteral },
    { raw: "0B0101_0101",           value: 85,                    type: Token.NumericLiteral },
    { raw: "01234567",              value: 342391,                type: Token.NumericLiteral },
    { raw: "0_1234567",             value: 342391,                type: Token.NumericLiteral },
    { raw: "0o1234567",             value: 342391,                type: Token.NumericLiteral },
    { raw: "0O1234567",             value: 342391,                type: Token.NumericLiteral },
    { raw: "0o1_234567",            value: 342391,                type: Token.NumericLiteral },
    { raw: "0O1_234567",            value: 342391,                type: Token.NumericLiteral },
    { raw: "true",                  value: true,                  type: Token.BooleanLiteral },
    { raw: "false",                 value: false,                 type: Token.BooleanLiteral },
    { raw: "null",                  value: null,                  type: Token.NullLiteral },
    { raw: "if",                    value: "if",                  type: Token.Keyword },
    { raw: "in",                    value: "in",                  type: Token.Keyword },
    { raw: "do",                    value: "do",                  type: Token.Keyword },
    { raw: "var",                   value: "var",                 type: Token.Keyword },
    { raw: "for",                   value: "for",                 type: Token.Keyword },
    { raw: "new",                   value: "new",                 type: Token.Keyword },
    { raw: "try",                   value: "try",                 type: Token.Keyword },
    { raw: "let",                   value: "let",                 type: Token.Keyword },
    { raw: "this",                  value: "this",                type: Token.Keyword },
    { raw: "else",                  value: "else",                type: Token.Keyword },
    { raw: "case",                  value: "case",                type: Token.Keyword },
    { raw: "void",                  value: "void",                type: Token.Keyword },
    { raw: "with",                  value: "with",                type: Token.Keyword },
    { raw: "enum",                  value: "enum",                type: Token.Keyword },
    { raw: "while",                 value: "while",               type: Token.Keyword },
    { raw: "break",                 value: "break",               type: Token.Keyword },
    { raw: "catch",                 value: "catch",               type: Token.Keyword },
    { raw: "throw",                 value: "throw",               type: Token.Keyword },
    { raw: "const",                 value: "const",               type: Token.Keyword },
    { raw: "yield",                 value: "yield",               type: Token.Keyword },
    { raw: "class",                 value: "class",               type: Token.Keyword },
    { raw: "super",                 value: "super",               type: Token.Keyword },
    { raw: "return",                value: "return",              type: Token.Keyword },
    { raw: "typeof",                value: "typeof",              type: Token.Keyword },
    { raw: "delete",                value: "delete",              type: Token.Keyword },
    { raw: "switch",                value: "switch",              type: Token.Keyword },
    { raw: "export",                value: "export",              type: Token.Keyword },
    { raw: "import",                value: "import",              type: Token.Keyword },
    { raw: "default",               value: "default",             type: Token.Keyword },
    { raw: "finally",               value: "finally",             type: Token.Keyword },
    { raw: "extends",               value: "extends",             type: Token.Keyword },
    { raw: "function",              value: "function",            type: Token.Keyword },
    { raw: "continue",              value: "continue",            type: Token.Keyword },
    { raw: "debugger",              value: "debugger",            type: Token.Keyword },
    { raw: "instanceof",            value: "instanceof",          type: Token.Keyword },
    { raw: "(",                     value: "(",                   type: Token.Punctuator },
    { raw: "{",                     value: "{",                   type: Token.Punctuator },
    { raw: ".",                     value: ".",                   type: Token.Punctuator },
    { raw: "...",                   value: "...",                 type: Token.Punctuator },
    { raw: "}",                     value: "}",                   type: Token.Punctuator },
    { raw: ")",                     value: ")",                   type: Token.Punctuator },
    { raw: ";",                     value: ";",                   type: Token.Punctuator },
    { raw: ",",                     value: ",",                   type: Token.Punctuator },
    { raw: "[",                     value: "[",                   type: Token.Punctuator },
    { raw: "]",                     value: "]",                   type: Token.Punctuator },
    { raw: ":",                     value: ":",                   type: Token.Punctuator },
    { raw: "?",                     value: "?",                   type: Token.Punctuator },
    { raw: "~",                     value: "~",                   type: Token.Punctuator },
    { raw: ">>>=",                  value: ">>>=",                type: Token.Punctuator },
    { raw: "===",                   value: "===",                 type: Token.Punctuator },
    { raw: "!==",                   value: "!==",                 type: Token.Punctuator },
    { raw: ">>>",                   value: ">>>",                 type: Token.Punctuator },
    { raw: "<<=",                   value: "<<=",                 type: Token.Punctuator },
    { raw: ">>=",                   value: ">>=",                 type: Token.Punctuator },
    { raw: "**=",                   value: "**=",                 type: Token.Punctuator },
    { raw: "&&",                    value: "&&",                  type: Token.Punctuator },
    { raw: "||",                    value: "||",                  type: Token.Punctuator },
    { raw: "==",                    value: "==",                  type: Token.Punctuator },
    { raw: "!=",                    value: "!=",                  type: Token.Punctuator },
    { raw: "+=",                    value: "+=",                  type: Token.Punctuator },
    { raw: "-=",                    value: "-=",                  type: Token.Punctuator },
    { raw: "*=",                    value: "*=",                  type: Token.Punctuator },
    { raw: "/=",                    value: "/=",                  type: Token.Punctuator },
    { raw: "++",                    value: "++",                  type: Token.Punctuator },
    { raw: "--",                    value: "--",                  type: Token.Punctuator },
    { raw: "<<",                    value: "<<",                  type: Token.Punctuator },
    { raw: ">>",                    value: ">>",                  type: Token.Punctuator },
    { raw: "&=",                    value: "&=",                  type: Token.Punctuator },
    { raw: "|=",                    value: "|=",                  type: Token.Punctuator },
    { raw: "^=",                    value: "^=",                  type: Token.Punctuator },
    { raw: "%=",                    value: "%=",                  type: Token.Punctuator },
    { raw: "<=",                    value: "<=",                  type: Token.Punctuator },
    { raw: ">=",                    value: ">=",                  type: Token.Punctuator },
    { raw: "=>",                    value: "=>",                  type: Token.Punctuator },
    { raw: "**",                    value: "**",                  type: Token.Punctuator },
    { raw: "<",                     value: "<",                   type: Token.Punctuator },
    { raw: ">",                     value: ">",                   type: Token.Punctuator },
    { raw: "=",                     value: "=",                   type: Token.Punctuator },
    { raw: "!",                     value: "!",                   type: Token.Punctuator },
    { raw: "+",                     value: "+",                   type: Token.Punctuator },
    { raw: "-",                     value: "-",                   type: Token.Punctuator },
    { raw: "*",                     value: "*",                   type: Token.Punctuator },
    { raw: "%",                     value: "%",                   type: Token.Punctuator },
    { raw: "&",                     value: "&",                   type: Token.Punctuator },
    { raw: "|",                     value: "|",                   type: Token.Punctuator },
    { raw: "^",                     value: "^",                   type: Token.Punctuator },
    { raw: "/",                     value: "/",                   type: Token.Punctuator },
];

const invalidTokens =
[
    { value: "1i",     message: Messages.unexpectedTokenIllegal },
    { value: "1_.123", message: Messages.numericSepatorNotAllowed },
    { value: "1._123", message: Messages.numericSepatorNotAllowed },
    { value: "1.123_", message: Messages.numericSepatorNotAllowed },
    { value: "0xhij",  message: Messages.unexpectedTokenIllegal },
    { value: "0x_12",  message: Messages.numericSepatorNotAllowed },
    { value: "0x12_",  message: Messages.numericSepatorNotAllowed },
    { value: "0b_10",  message: Messages.numericSepatorNotAllowed },
    { value: "0b23",   message: Messages.unexpectedTokenIllegal },
    { value: "0b10_",  message: Messages.numericSepatorNotAllowed },
    { value: "0o_10",  message: Messages.numericSepatorNotAllowed },
    { value: "0O_10",  message: Messages.numericSepatorNotAllowed },
    { value: "0o10_",  message: Messages.numericSepatorNotAllowed },
    { value: "0O10_",  message: Messages.numericSepatorNotAllowed },
    { value: "010_",   message: Messages.numericSepatorNotAllowed },
];

describe
(
    "Tokenizer",
    () =>
    {
        describe
        (
            "Valid tokens",
            () =>
            {
                for (const token of validTokens)
                {
                    it
                    (
                        `Token ${token.raw} should be ${Token[token.type]}`,
                        () => expect(new Scanner(token.raw).nextToken())
                            .include({ raw: token.raw, value: token.value, type: token.type })
                    );
                }
            }
        );

        describe
        (
            "Invalid tokens",
            () =>
            {
                for (const token of invalidTokens)
                {
                    const scanner = new Scanner(token.value);
                    it(`Token ${token.value} must dispatch an Syntax Error`, () => expect(() => scanner.nextToken()).to.throw(SyntaxError, token.message));
                }
            }
        );

        describe
        (
            "Template strings",
            () =>
            {
                const scanner = new Scanner("`start ${identifier} middle ${1} end`");

                it(`First template segment.`,  () => expect(scanner.nextToken()).include({ value: "start ",     type: Token.Template }));
                it(`First interporlation.`,    () => expect(scanner.nextToken()).include({ raw:   "identifier", type: Token.Identifier }));
                it(`Second template segment.`, () => expect(scanner.nextToken()).include({ value: " middle ",   type: Token.Template }));
                it(`Second interporlation.`,   () => expect(scanner.nextToken()).include({ value: 1,            type: Token.NumericLiteral }));
                it(`Third template segment.`,  () => expect(scanner.nextToken()).include({ value: " end",       type: Token.Template }));
            }
        );

        describe
        (
            "Regular Expressions",
            () =>
            {
                it
                (
                    "Pattern without flags",
                    () => expect(new Scanner("/foo[123]bar()\\//").scanRegex())
                        .include({ raw: "/foo[123]bar()\\//", pattern: "foo[123]bar()\\/", type: Token.RegularExpression })
                        .and.not.have.key("flag")
                );

                it
                (
                    "Pattern with flags",
                    () => expect(new Scanner("/foo[123]bar()\\//ig").scanRegex())
                        .include({ raw: "/foo[123]bar()\\//ig", pattern: "foo[123]bar()\\/", flags: "ig", type: Token.RegularExpression })
                );
            }
        );
    }
);