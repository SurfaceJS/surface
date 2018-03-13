import { expect } from "chai";

import { invalidTokens, validTokens } from "./fixtures/tokens";

import Messages    from "../internal/messages";
import Scanner     from "../internal/scanner";
import SyntaxError from "../internal/syntax-error";
import TokenType   from "../internal/token-type";

describe
(
    "Tokenizer",
    () =>
    {
        describe
        (
            "Tokens should work",
            () =>
            {
                for (const token of validTokens)
                {
                    it
                    (
                        `Token ${token.raw} should be ${TokenType[token.type]}`,
                        () => expect(new Scanner(token.raw).nextToken()).to.deep.equal(token)
                    );
                }
            }
        );

        describe
        (
            "Tokens should throw",
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
            "Templates should work",
            () =>
            {
                const scanner = new Scanner("`start ${identifier} middle ${1} end`");

                it(`First template segment.`,  () => expect(scanner.nextToken()).include({ value: "start ",     type: TokenType.Template }));
                it(`First interporlation.`,    () => expect(scanner.nextToken()).include({ raw:   "identifier", type: TokenType.Identifier }));
                it(`Second template segment.`, () => expect(scanner.nextToken()).include({ value: " middle ",   type: TokenType.Template }));
                it(`Second interporlation.`,   () => expect(scanner.nextToken()).include({ value: 1,            type: TokenType.NumericLiteral }));
                it(`Third template segment.`,  () => expect(scanner.nextToken()).include({ value: " end",       type: TokenType.Template }));
            }
        );

        describe
        (
            "Regex should work",
            () =>
            {
                it
                (
                    "Pattern without flags",
                    () => expect(new Scanner("/foo[123]bar()\\//").scanRegex())
                        .include({ raw: "/foo[123]bar()\\//", pattern: "foo[123]bar()\\/", type: TokenType.RegularExpression })
                        .and.not.have.key("flag")
                );

                it
                (
                    "Pattern with flags",
                    () => expect(new Scanner("/foo[123]bar()\\//ig").scanRegex())
                        .include({ raw: "/foo[123]bar()\\//ig", pattern: "foo[123]bar()\\/", flags: "ig", type: TokenType.RegularExpression })
                );
            }
        );

        describe
        (
            "Regex should throw",
            () =>
            {

                it
                (
                    "Unterminate pattern",
                    () =>
                    {
                        expect(() => new Scanner("foo[123]bar()\\//").scanRegex()).to.throw(SyntaxError, Messages.unexpectedTokenIllegal);
                        expect(() => new Scanner("/foo[123]bar()\\/").scanRegex()).to.throw(SyntaxError, Messages.unterminatedRegExp);
                        expect(() => new Scanner("/\\\r").scanRegex()).to.throw(SyntaxError, Messages.unterminatedRegExp);
                    }
                );
            }
        );
    }
);