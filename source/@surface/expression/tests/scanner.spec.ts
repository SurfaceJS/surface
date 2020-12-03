import { batchTest, shouldFail, shouldPass, suite, test }                       from "@surface/test-suite";
import { expect }                                                               from "chai";
import Messages                                                                 from "../internal/messages";
import Scanner                                                                  from "../internal/scanner";
import SyntaxError                                                              from "../internal/syntax-error";
import TokenType                                                                from "../internal/token-type";
import { ExpectedInvalidToken, ExpectedValidToken, invalidTokens, validTokens } from "./expectations/scanner-expected";

@suite
export default class ScannerSpec
{
    @shouldPass
    @test
    public regexWithFlags(): void
    {
        expect(new Scanner("/foo[123]bar()\\//").scanRegex())
            .include({ pattern: "foo[123]bar()\\/", raw: "/foo[123]bar()\\//", type: TokenType.RegularExpression })
            .and.not.have.key("flag");
    }

    @shouldPass
    @test
    public regexWithoutFlags(): void
    {
        expect(new Scanner("/foo[123]bar()\\//ig").scanRegex())
            .include({ flags: "ig", pattern: "foo[123]bar()\\/", raw: "/foo[123]bar()\\//ig", type: TokenType.RegularExpression });
    }

    @shouldPass
    @test
    public templateStringWithInterpolation(): void
    {
        // eslint-disable-next-line no-template-curly-in-string
        const scanner = new Scanner("`start ${identifier} middle ${1} end`");

        expect(scanner.nextToken()).include({ type: TokenType.Template,       value: "start " });
        expect(scanner.nextToken()).include({ raw: "identifier", type: TokenType.Identifier });
        expect(scanner.nextToken()).include({ type: TokenType.Template,       value: " middle " });
        expect(scanner.nextToken()).include({ type: TokenType.NumericLiteral, value: 1 });
        expect(scanner.nextToken()).include({ type: TokenType.Template,       value: " end" });
    }

    @shouldPass
    @batchTest(validTokens, x => `token (${x.source}) should be ${TokenType[x.token.type]}`)
    public tokensShouldWork(expected: ExpectedValidToken): void
    {
        expect(new Scanner(expected.source).nextToken()).to.deep.equal(expected.token);
    }

    @test @shouldPass
    public backtrack(): void
    {
        const scanner = new Scanner("x.y");

        expect(scanner.index).to.equal(0);
        expect(scanner.nextToken().raw).to.equal("x");
        expect(scanner.index).to.equal(1);

        scanner.backtrack(1);

        expect(scanner.index).to.equal(0);
        expect(scanner.nextToken().raw).to.equal("x");
        expect(scanner.index).to.equal(1);
    }

    @shouldFail @test
    public invalidRegex(): void
    {
        expect(() => new Scanner("foo[123]bar()\\//").scanRegex()).to.throw(SyntaxError, Messages.invalidOrUnexpectedToken);
        expect(() => new Scanner("/foo[123]bar()\\/").scanRegex()).to.throw(SyntaxError, Messages.invalidRegularExpressionMissingToken);
        expect(() => new Scanner("/foo/ig1/").scanRegex()).to.throw("Invalid flags supplied to RegExp constructor 'ig1'");
        expect(() => new Scanner("/\\\r").scanRegex()).to.throw(SyntaxError, Messages.invalidRegularExpressionMissingToken);
    }

    @shouldFail @batchTest(invalidTokens, x => `token (${x.token}) should throw ${x.message}`)
    public tokensShouldThrow(expected: ExpectedInvalidToken): void
    {
        const scanner = new Scanner(expected.token);
        expect(() => scanner.nextToken()).to.throw(SyntaxError, expected.message);
    }
}