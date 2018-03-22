import { batchTest, category, suite, test }         from "@surface/test-suite";
import { expect }                                   from "chai";
import Messages                                     from "../internal/messages";
import Scanner, { Token }                           from "../internal/scanner";
import SyntaxError                                  from "../internal/syntax-error";
import TokenType                                    from "../internal/token-type";
import { invalidTokens, validTokens, InvalidToken } from "./fixtures/tokens";

@suite("Scanner")
export default class ScannerSpec
{
    @category("Regex should throw")
    @test("Invalid Regex")
    public invalidRegex(): void
    {
        expect(() => new Scanner("foo[123]bar()\\//").scanRegex()).to.throw(SyntaxError, Messages.unexpectedTokenIllegal);
        expect(() => new Scanner("/foo[123]bar()\\/").scanRegex()).to.throw(SyntaxError, Messages.unterminatedRegExp);
        expect(() => new Scanner("/\\\r").scanRegex()).to.throw(SyntaxError, Messages.unterminatedRegExp);
    }

    @category("Regex should work")
    @test("With flags")
    public regexWithFlags(): void
    {
        expect(new Scanner("/foo[123]bar()\\//").scanRegex())
            .include({ raw: "/foo[123]bar()\\//", pattern: "foo[123]bar()\\/", type: TokenType.RegularExpression })
            .and.not.have.key("flag");
    }

    @category("Regex should work")
    @test("Without flags")
    public regexWithoutFlags(): void
    {
        expect(new Scanner("/foo[123]bar()\\//ig").scanRegex())
            .include({ raw: "/foo[123]bar()\\//ig", pattern: "foo[123]bar()\\/", flags: "ig", type: TokenType.RegularExpression });
    }

    @category("Template")
    @test("Template should work")
    public templateShouldWork(): void
    {
        const scanner = new Scanner("`start ${identifier} middle ${1} end`");

        expect(scanner.nextToken()).include({ value: "start ",     type: TokenType.Template });
        expect(scanner.nextToken()).include({ raw:   "identifier", type: TokenType.Identifier });
        expect(scanner.nextToken()).include({ value: " middle ",   type: TokenType.Template });
        expect(scanner.nextToken()).include({ value: 1,            type: TokenType.NumericLiteral });
        expect(scanner.nextToken()).include({ value: " end",       type: TokenType.Template });
    }

    @category("Tokens should work")
    @batchTest(validTokens, x => `Token ${x.raw} should be ${TokenType[x.type]}`)
    public tokensShouldWork(token: Token): void
    {
        expect(new Scanner(token.raw).nextToken()).to.deep.equal(token);
    }

    @category("Tokens should throw")
    @batchTest(invalidTokens, x => `Token ${x.expression} must dispatch an Syntax Error`)
    public tokensShouldThrow(spec: InvalidToken): void
    {
        const scanner = new Scanner(spec.expression);
        expect(() => scanner.nextToken()).to.throw(SyntaxError, spec.message);
    }
}