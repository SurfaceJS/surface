import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                                         from "chai";
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
        assert.isFalse("flag" in token);
        assert.include(token, { pattern: "foo[123]bar()\\/", raw: "/foo[123]bar()\\//", type: TokenType.RegularExpression });
    }

    @shouldPass
    @test
    public regexWithoutFlags(): void
    {
        assert.include(new Scanner("/foo[123]bar()\\//ig").scanRegex(), { flags: "ig", pattern: "foo[123]bar()\\/", raw: "/foo[123]bar()\\//ig", type: TokenType.RegularExpression });
    }

    @shouldPass
    @test
    public templateStringWithInterpolation(): void
    {
        // eslint-disable-next-line no-template-curly-in-string
        const scanner = new Scanner("`start ${identifier} middle ${1} end`");

        assert.include(scanner.nextToken(), { type: TokenType.Template,       value: "start " });
        assert.include(scanner.nextToken(), { raw: "identifier", type: TokenType.Identifier });
        assert.include(scanner.nextToken(), { type: TokenType.Template,       value: " middle " });
        assert.include(scanner.nextToken(), { type: TokenType.NumericLiteral, value: 1 });
        assert.include(scanner.nextToken(), { type: TokenType.Template,       value: " end" });
    }

    @shouldPass
    @batchTest(validTokens, x => `token (${x.source}) should be ${TokenType[x.token.type]}`)
    public tokensShouldWork(expected: ExpectedValidToken): void
    {
        assert.deepEqual(new Scanner(expected.source).nextToken(), expected.token);
    }

    @test @shouldPass
    public backtrack(): void
    {
        const scanner = new Scanner("x.y");

        assert.equal(scanner.index, 0);
        assert.equal(scanner.nextToken().raw, "x");
        assert.equal(scanner.index, 1);

        scanner.backtrack(1);

        assert.equal(scanner.index, 0);
        assert.equal(scanner.nextToken().raw, "x");
        assert.equal(scanner.index, 1);
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

        assert.equal(token.raw, "x");
        assert.equal(token.lineNumber, 2);

        token = scanner.nextToken();

        assert.equal(token.raw, "+");
        assert.equal(token.lineNumber, 3);

        token = scanner.nextToken();

        assert.equal(token.raw, "y");
        assert.equal(token.lineNumber, 4);
    }

    @shouldFail @test
    public invalidRegex(): void
    {
        assert.throw(() => new Scanner("foo[123]bar()\\//").scanRegex(), SyntaxError, Messages.invalidOrUnexpectedToken);
        assert.throw(() => new Scanner("/foo[123]bar()\\/").scanRegex(), SyntaxError, Messages.invalidRegularExpressionMissingToken);
        assert.throw(() => new Scanner("/foo/ig1/").scanRegex(), "Invalid flags supplied to RegExp constructor 'ig1'");
        assert.throw(() => new Scanner("/\\\r").scanRegex(), SyntaxError, Messages.invalidRegularExpressionMissingToken);
    }

    @shouldFail @batchTest(invalidTokens, x => `token (${x.token}) should throw ${x.message}`)
    public tokensShouldThrow(expected: ExpectedInvalidToken): void
    {
        const scanner = new Scanner(expected.token);

        assert.throw(() => scanner.nextToken(), SyntaxError, expected.message);
    }
}
