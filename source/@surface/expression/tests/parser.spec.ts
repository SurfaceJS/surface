import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                                          from "chai";
import ParenthesizedExpression                            from "../internal/expressions/parenthesized-expression";
import Parser                                             from "../internal/parser";
import TypeGuard                                          from "../internal/type-guard";
import
{
    invalidExpressions,
    validExpressions,
    InvalidParseExpectedSpec,
    ParseExpectedSpec
} from "./expectations/parser-expected";

@suite
export default class ParserSpec
{
    @test @shouldPass
    public benchmark(): void
    {
        // const nativeContext = { x: { elements: [] }, index: 0 };
        // const proxyContext  = { x: { elements: [] }, index: 0 };

        // const raw = "x.elements.push({ id: index, row: index % 2 == 0 ? 'even' : 'odd' })";

        // const native = Function(`with(this) { ${raw} }`).bind(nativeContext);
        // const proxy  = Parser.parse(raw, proxyContext);

        // const nativeStart = Date.now();

        // for (let index = 0; index < 1_000_000; index++)
        // {
        //     nativeContext.index = index;
        //     native();
        // }

        // const nativeTime = Date.now() - nativeStart;

        // const proxyStart = Date.now();

        // for (let index = 0; index < 1_000_000; index++)
        // {
        //     proxyContext.index = index;
        //     proxy.evaluate();
        // }

        // const proxyTime  = Date.now() - proxyStart;
        // const difference = ((proxyTime - nativeTime) / proxyTime) * 100;

        // chai.expect(difference).to.lessThan(20);
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

        if (parseExpectedSpec.value instanceof Function)
        {
            chai.expect((expression.evaluate(parseExpectedSpec.scope) as Function).toString(), "evaluate").to.deep.equal(parseExpectedSpec.value.toString());
            chai.expect((expression.evaluate(parseExpectedSpec.scope, true) as Function).toString(), "evaluate using cache").to.deep.equal(parseExpectedSpec.value.toString());
        }
        else
        {
            chai.expect(expression.evaluate(parseExpectedSpec.scope), "evaluate").to.deep.equal(parseExpectedSpec.value);
            chai.expect(expression.evaluate(parseExpectedSpec.scope, true), "evaluate using cache").to.deep.equal(parseExpectedSpec.value);
        }

        chai.expect(expression, "instanceof").instanceof(parseExpectedSpec.type);
        chai.expect(expression.toString(), "toString").to.equal(parseExpectedSpec.toString);
    }

    @test("expression: ((a && b) || x && y); should be evaluated to ParenthesizedExpression: false") @shouldPass
    public parenthesizedExpression(): void
    {
        const scope = { a: true, b: false, x: false, y: true };

        const expression = Parser.parse("((a && b) || x && y)");

        chai.expect(expression.evaluate(scope), "evaluate").to.deep.equal(false);
        chai.expect(expression.evaluate(scope, true), "evaluate using cache").to.deep.equal(false);
        chai.expect(expression, "instanceof").instanceof(ParenthesizedExpression);
        chai.expect(expression.toString(), "toString").to.equal("((a && b) || x && y)");
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
            chai.expect(error.message).to.equal(invalidParseExpectedSpec.error.message);
            chai.expect(error).to.includes(invalidParseExpectedSpec.error);
        }
    }
}