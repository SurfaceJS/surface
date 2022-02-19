import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                               from "chai";
import Messages                                           from "../internal/messages.js";
import Scanner                                            from "../internal/scanner.js";
import SyntaxError                                        from "../internal/syntax-error.js";
import TokenType                                          from "../internal/token-type.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { ExpectedInvalidToken, ExpectedValidToken }  from "./scanner-expectations.js";
import { invalidTokens, validTokens }                     from "./scanner-expectations.js";

@suite
export default class ScannerSpec
{
    @shouldPass
    @test
    public regexWithFlags(): void
    {
        const token = new Scanner("/foo[123]bar()\\//").scanRegex();
        chai.assert.isFalse("flag" in token);
        chai.assert.include(token, { pattern: "foo[123]bar()\\/", raw: "/foo[123]bar()\\//", type: TokenType.RegularExpression });
    }

    @shouldPass
    @test
    public regexWithoutFlags(): void
    {
        chai.assert.include(new Scanner("/foo[123]bar()\\//ig").scanRegex(), { flags: "ig", pattern: "foo[123]bar()\\/", raw: "/foo[123]bar()\\//ig", type: TokenType.RegularExpression });
    }

    @shouldPass
    @test
    public templateStringWithInterpolation(): void
    {
        // eslint-disable-next-line no-template-curly-in-string
        const scanner = new Scanner("`start ${identifier} middle ${1} end`");

        chai.assert.include(scanner.nextToken(), { type: TokenType.Template,       value: "start " });
        chai.assert.include(scanner.nextToken(), { raw: "identifier", type: TokenType.Identifier });
        chai.assert.include(scanner.nextToken(), { type: TokenType.Template,       value: " middle " });
        chai.assert.include(scanner.nextToken(), { type: TokenType.NumericLiteral, value: 1 });
        chai.assert.include(scanner.nextToken(), { type: TokenType.Template,       value: " end" });
    }

    @shouldPass
    @batchTest(validTokens, x => `token (${x.source}) should be ${TokenType[x.token.type]}`)
    public tokensShouldWork(expected: ExpectedValidToken): void
    {
        chai.assert.deepEqual(new Scanner(expected.source).nextToken(), expected.token);
    }

    @test @shouldPass
    public backtrack(): void
    {
        const scanner = new Scanner("x.y");

        chai.assert.equal(scanner.index, 0);
        chai.assert.equal(scanner.nextToken().raw, "x");
        chai.assert.equal(scanner.index, 1);

        scanner.backtrack(1);

        chai.assert.equal(scanner.index, 0);
        chai.assert.equal(scanner.nextToken().raw, "x");
        chai.assert.equal(scanner.index, 1);
    }

    @test @shouldPass
    public multiline(): void
    {
        const source =
        `
            x
            +
            y
        `;

        const scanner = new Scanner(source);

        let token = scanner.nextToken();

        chai.assert.equal(token.raw, "x");
        chai.assert.equal(token.lineNumber, 2);

        token = scanner.nextToken();

        chai.assert.equal(token.raw, "+");
        chai.assert.equal(token.lineNumber, 3);

        token = scanner.nextToken();

        chai.assert.equal(token.raw, "y");
        chai.assert.equal(token.lineNumber, 4);
    }

    @shouldFail @test
    public invalidRegex(): void
    {
        chai.assert.throw(() => new Scanner("foo[123]bar()\\//").scanRegex(), SyntaxError, Messages.invalidOrUnexpectedToken);
        chai.assert.throw(() => new Scanner("/foo[123]bar()\\/").scanRegex(), SyntaxError, Messages.invalidRegularExpressionMissingToken);
        chai.assert.throw(() => new Scanner("/foo/ig1/").scanRegex(), "Invalid flags supplied to RegExp constructor 'ig1'");
        chai.assert.throw(() => new Scanner("/\\\r").scanRegex(), SyntaxError, Messages.invalidRegularExpressionMissingToken);
    }

    @shouldFail @batchTest(invalidTokens, x => `token (${x.token}) should throw ${x.message}`)
    public tokensShouldThrow(expected: ExpectedInvalidToken): void
    {
        const scanner = new Scanner(expected.token);

        chai.assert.throw(() => scanner.nextToken(), SyntaxError, expected.message);
    }
}