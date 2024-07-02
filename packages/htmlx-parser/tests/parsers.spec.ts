import { resolveError }                                                     from "@surface/core";
import { SyntaxError, TypeGuard }                                           from "@surface/expression";
import { shouldFail, shouldPass, suite, test }                              from "@surface/test-suite";
import { assert }                                                           from "chai";
import { parseDestructuredPattern, parseExpression, parseForLoopStatement } from "../internal/expression-parsers.js";

type RawError = { message: string } | Pick<SyntaxError, "message" | "lineNumber" | "index" | "column">;

function parseWithError(parser: (expression: string) => unknown, expression: string): RawError
{
    try
    {
        parser(expression);
    }
    catch (error)
    {
        return toRaw(resolveError(error));
    }

    return toRaw(new SyntaxError("", 0, 0, 0));
}

function toRaw(error: Error): RawError
{
    if (error instanceof SyntaxError)
    {
        return {
            column:     error.column,
            index:      error.index,
            lineNumber: error.lineNumber,
            message:    error.message,
        };
    }

    return { message: error.message };
}

@suite
export default class ParsersSpec
{
    @test @shouldPass
    public parseExpression(): void
    {
        const expression = "x + 1";

        const actual = parseExpression(expression);

        assert.isTrue(TypeGuard.isBinaryExpression(actual));

        assert.equal(actual, parseExpression(expression));
    }

    @test @shouldPass
    public parseDestructuredArrayPattern(): void
    {
        const expression = "[foo]";

        const actual = parseDestructuredPattern(expression);

        assert.isTrue(TypeGuard.isArrayPattern(actual));

        assert.equal(actual, parseDestructuredPattern(expression));
    }

    @test @shouldPass
    public parseDestructuredObjectPattern(): void
    {
        const expression = "{ foo: bar }";

        const actual = parseDestructuredPattern(expression);

        assert.isTrue(TypeGuard.isObjectPattern(actual));

        assert.equal(actual, parseDestructuredPattern(expression));
    }

    @test @shouldPass
    public parseForLoopStatementIdentifierAlias(): void
    {
        const expression = "foo in bar";

        const actual = parseForLoopStatement(expression);

        assert.isTrue(TypeGuard.isIdentifier(actual.left));
        assert.isTrue(TypeGuard.isIdentifier(actual.right));
        assert.equal(actual.operator, "in");

        assert.equal(actual, parseForLoopStatement(expression));
    }

    @test @shouldPass
    public parseForLoopStatementArrayDestructured(): void
    {
        const expression = "let [foo] of bar";

        const actual = parseForLoopStatement(expression);

        assert.isTrue(TypeGuard.isArrayPattern(actual.left));
        assert.isTrue(TypeGuard.isIdentifier(actual.right));
        assert.equal(actual.operator, "of");

        assert.equal(actual, parseForLoopStatement(expression));
    }

    @test @shouldPass
    public parseForLoopStatementObjectDestructured(): void
    {
        const expression = "const { foo } of bar";

        const actual = parseForLoopStatement(expression);

        assert.isTrue(TypeGuard.isObjectPattern(actual.left));
        assert.isTrue(TypeGuard.isIdentifier(actual.right));
        assert.equal(actual.operator, "of");

        assert.equal(actual, parseForLoopStatement(expression));
    }

    @test @shouldFail
    public cannotRedeclareForLoopStatementArrayDestructured(): void
    {
        const expression = "let [a, a] in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Cannot redeclare block-scoped variable", 1, 4, 5)));

        const expressionWithLineBreak = "\n  let \n [a, a] in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Cannot redeclare block-scoped variable", 3, 9, 2)));
    }

    @test @shouldFail
    public cannotRedeclareForLoopStatementObjectDestructured(): void
    {
        const expression = "let { a, a } in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Cannot redeclare block-scoped variable", 1, 4, 5)));

        const expressionWithLineBreak = "\n  let \n { a, a } in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Cannot redeclare block-scoped variable", 3, 9, 2)));
    }

    @test @shouldFail
    public illegalPropertyForLoopStatementArrayDestructured(): void
    {
        const expression = "var [foo.x] in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Illegal property in declaration context", 1, 4, 5)));

        const expressionWithLineBreak = "\n  var \n [foo.x] in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Illegal property in declaration context", 3, 9, 2)));
    }

    @test @shouldFail
    public invalidDestructured(): void
    {
        const expression = "[1]";

        assert.deepEqual(parseWithError(parseDestructuredPattern, expression), toRaw(new SyntaxError("Invalid destructuring assignment target", 1, 0, 1)));

        const expressionWithLineBreak = "  \n   [1]";

        assert.deepEqual(parseWithError(parseDestructuredPattern, expressionWithLineBreak), toRaw(new SyntaxError("Invalid destructuring assignment target", 2, 6, 4)));
    }

    @test @shouldFail
    public invalidForLoopStatement(): void
    {
        const expression = "x foo y bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new Error("Invalid for-loop statement")));
    }

    @test @shouldFail
    public invalidLeftForLoopStatement(): void
    {
        const expression = "let foo++ in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Invalid left-hand side in for-loop", 1, 4, 5)));

        const expressionWithLineBreak = "\n  let \n foo++ \n in \n bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Invalid left-hand side in for-loop", 3, 9, 2)));
    }

    @test @shouldFail
    public unexpectedTokenForLoopStatement(): void
    {
        const expression = "x foo in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Unexpected token foo", 1, 2, 3)));
    }

    @test @shouldFail
    public unexpectedTokenForLoopStatementLeftHand(): void
    {
        const expression = "var foo.1 in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Unexpected number", 1, 7, 8)));

        const expressionWithLineBreak = "\n  var \n foo.1 in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Unexpected number", 3, 12, 5)));
    }

    @test @shouldFail
    public unexpectedTokenForLoopStatementRightHand(): void
    {
        const expression = "let foo in foo.1";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Unexpected number", 1, 14, 15)));

        const expressionWithLineBreak = "\n  let \n foo \n in \n foo.1";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Unexpected number", 5, 23, 5)));
    }

    @test @shouldFail
    public unexpectedTokenForLoopStatementObjectDestructured(): void
    {
        const expression = "var { foo.x } in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expression), toRaw(new SyntaxError("Unexpected token .", 1, 9, 10)));

        const expressionWithLineBreak = "\n  var \n { \nfoo.x } in bar";

        assert.deepEqual(parseWithError(parseForLoopStatement, expressionWithLineBreak), toRaw(new SyntaxError("Unexpected token .", 4, 15, 4)));
    }
}
