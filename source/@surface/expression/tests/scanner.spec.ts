import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                                         from "chai";
import Messages                                           from "../internal/messages";
import Scanner, { Token }                                 from "../internal/scanner";
import TokenType                                          from "../internal/token-type";
import SyntaxError                                        from "../syntax-error";
import { invalidTokens, validTokens, InvalidToken }       from "./fixtures/tokens";

@suite
export default class ScannerSpec
{
    @shouldPass
    @test
    public regexWithFlags(): void
    {
        expect(new Scanner("/foo[123]bar()\\//").scanRegex())
            .include({ raw: "/foo[123]bar()\\//", pattern: "foo[123]bar()\\/", type: TokenType.RegularExpression })
            .and.not.have.key("flag");
    }

    @shouldPass
    @test
    public regexWithoutFlags(): void
    {
        expect(new Scanner("/foo[123]bar()\\//ig").scanRegex())
            .include({ raw: "/foo[123]bar()\\//ig", pattern: "foo[123]bar()\\/", flags: "ig", type: TokenType.RegularExpression });
    }

    @shouldPass
    @test
    public templateStringWithInterpolation(): void
    {
        const scanner = new Scanner("`start ${identifier} middle ${1} end`");

        expect(scanner.nextToken()).include({ value: "start ",     type: TokenType.Template });
        expect(scanner.nextToken()).include({ raw:   "identifier", type: TokenType.Identifier });
        expect(scanner.nextToken()).include({ value: " middle ",   type: TokenType.Template });
        expect(scanner.nextToken()).include({ value: 1,            type: TokenType.NumericLiteral });
        expect(scanner.nextToken()).include({ value: " end",       type: TokenType.Template });
    }

    @shouldPass
    @batchTest(validTokens, x => `token (${x.raw}) should be ${TokenType[x.type]}`)
    public tokensShouldWork(token: Token): void
    {
        expect(new Scanner(token.raw).nextToken()).to.deep.equal(token);
    }

    @shouldFail
    @test
    public invalidRegex(): void
    {
        expect(() => new Scanner("foo[123]bar()\\//").scanRegex()).to.throw(SyntaxError, Messages.unexpectedTokenIllegal);
        expect(() => new Scanner("/foo[123]bar()\\/").scanRegex()).to.throw(SyntaxError, Messages.unterminatedRegExp);
        expect(() => new Scanner("/\\\r").scanRegex()).to.throw(SyntaxError, Messages.unterminatedRegExp);
    }

    @shouldFail
    @batchTest(invalidTokens, x => `token (${x.token}) should throw ${x.message}`)
    public tokensShouldThrow(spec: InvalidToken): void
    {
        const scanner = new Scanner(spec.token);
        expect(() => scanner.nextToken()).to.throw(SyntaxError, spec.message);
    }
}