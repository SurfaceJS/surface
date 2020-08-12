import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                                         from "chai";
import ParenthesizedExpression                            from "../internal/expressions/parenthesized-expression";
import Parser                                             from "../internal/parser";
import SyntaxError                                        from "../internal/syntax-error";
import TypeGuard                                          from "../internal/type-guard";
import
{
    InvalidParseExpectedSpec,
    ParseExpectedSpec,
    invalidExpressions,
    validExpressions,
} from "./expectations/parser-expected";

type RawSyntaxError = Pick<SyntaxError, "message" | "lineNumber" | "index" | "column"> | Pick<ReferenceError, "message">;

function toRaw(error: SyntaxError | ReferenceError): RawSyntaxError
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
export default class ParserSpec
{
    @test @shouldPass
    public benchmark(): void
    {

        // eslint-disable-next-line capitalized-comments
        /*
        const nativeContext = { x: { elements: [] }, index: 0 };
        const proxyContext  = { x: { elements: [] }, index: 0 };

        const raw = "x.elements.push({ id: index, row: index % 2 == 0 ? 'even' : 'odd' })";

        const native = Function(`with(this) { ${raw} }`).bind(nativeContext);
        const proxy  = Parser.parse(raw, proxyContext);

        const nativeStart = Date.now();

        for (let index = 0; index < 1_000_000; index++)
        {
            nativeContext.index = index;
            native();
        }

        const nativeTime = Date.now() - nativeStart;

        const proxyStart = Date.now();

        for (let index = 0; index < 1_000_000; index++)
        {
            proxyContext.index = index;
            proxy.evaluate();
        }

        const proxyTime  = Date.now() - proxyStart;
        const difference = ((proxyTime - nativeTime) / proxyTime) * 100;

        chai.expect(difference).to.lessThan(20);
        */
    }

    @shouldPass
    @batchTest(validExpressions, x => `expression: ${x.raw}; should be evaluated to ${x.type.name}: ${x.value}`)
    public expressionsShouldWork(parseExpectedSpec: ParseExpectedSpec): void
    {
        let expression = Parser.parse(parseExpectedSpec.raw);

        if (TypeGuard.isParenthesizedExpression(expression))
        {
            expression = expression.argument;
        }

        assert.deepEqual(expression, expression.clone(), "clone");

        if (parseExpectedSpec.value instanceof Function)
        {
            assert.equal((expression.evaluate(parseExpectedSpec.scope) as Function).toString(), parseExpectedSpec.value.toString(), "evaluate");
            assert.equal((expression.evaluate(parseExpectedSpec.scope, true) as Function).toString(), parseExpectedSpec.value.toString(), "evaluate using cache");
        }
        else
        {
            assert.deepEqual(expression.evaluate(parseExpectedSpec.scope), parseExpectedSpec.value, "evaluate");
            assert.deepEqual(expression.evaluate(parseExpectedSpec.scope, true), parseExpectedSpec.value, "evaluate using cache");
        }

        assert.instanceOf(expression, parseExpectedSpec.type, "instanceof");
        assert.equal(expression.toString(), parseExpectedSpec.toString, "toString");
    }

    @shouldPass
    @test("expression: ((a && b) || x && y); should be evaluated to ParenthesizedExpression: false")
    public parenthesizedExpression(): void
    {
        const scope = { a: true, b: false, x: false, y: true };

        const expression = Parser.parse("((a && b) || x && y)");

        assert.equal(expression.evaluate(scope), false, "evaluate");
        assert.equal(expression.evaluate(scope, true), false, "evaluate using cache");
        assert.instanceOf(expression, ParenthesizedExpression, "instanceof");
        assert.equal(expression.toString(), "((a && b) || x && y)", "toString");
    }

    @shouldFail
    @batchTest(invalidExpressions, x => `expression: ${x.raw}; should throw ${x.error.message}`)
    public expressionsShouldThrow(invalidParseExpectedSpec: InvalidParseExpectedSpec): void
    {
        try
        {
            Parser.parse(invalidParseExpectedSpec.raw);

            throw new Error(`expression ${invalidParseExpectedSpec.raw}; not throw`);
        }
        catch (error)
        {
            assert.deepEqual(toRaw(error), toRaw(invalidParseExpectedSpec.error));
        }
    }
}