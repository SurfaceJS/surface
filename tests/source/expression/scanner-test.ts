import { invalidTokens, validTokens } from "./data-tokens";

import { expect } from "chai";

import Scanner     from "@surface/expression/internal/scanner";
import SyntaxError from "@surface/expression/internal/syntax-error";
import Token       from "@surface/expression/internal/token";

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