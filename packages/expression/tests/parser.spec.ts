/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
import { batchTest, shouldFail, shouldPass, skip, suite, test } from "@surface/test-suite";
import { assert }                                               from "chai";
import ParenthesizedExpression                                  from "../internal/expressions/parenthesized-expression.js";
import Parser                                                   from "../internal/parser.js";
import SyntaxError                                              from "../internal/syntax-error.js";
import TypeGuard                                                from "../internal/type-guard.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { InvalidParseExpectedSpec, ParseExpectedSpec }     from "./parser-expectations.js";
import { invalidExpressions, validExpressions }                 from "./parser-expectations.js";

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
    @skip @test @shouldPass
    public benchmark(): void
    {
        const nativeContext = { index: 0, x: { elements: [] } };
        const proxyContext  = { index: 0, x: { elements: [] } };

        const raw = "x.elements.push({ id: index, row: index % 2 == 0 ? 'even' : 'odd' })";

        const native = Function(`with(this) { ${raw} }`).bind(nativeContext);
        const proxy  = Parser.parse(raw);

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
            proxy.evaluate(proxyContext);
        }

        const proxyTime  = Date.now() - proxyStart;
        const difference = (proxyTime - nativeTime) / proxyTime * 100;

        assert.isBelow(difference, 20);
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
        }
        else
        {
            assert.deepEqual(expression.evaluate(parseExpectedSpec.scope), parseExpectedSpec.value, "evaluate");
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
            assert(error instanceof Error);

            assert.deepEqual(toRaw(error), toRaw(invalidParseExpectedSpec.error));
        }
    }
}
