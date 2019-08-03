import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                                          from "chai";
import Parser                                             from "../internal/parser";
import
{
    invalidExpressions,
    validExpressions,
    ExpressionFixtureSpec,
    InvalidExpressionFixtureSpec
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
    @batchTest(validExpressions, x => `expression (${x.raw}) should be evaluated to ${x.type.name}: ${x.value}`)
    public expressionsShouldWork(expression: ExpressionFixtureSpec): void
    {
        const result = Parser.parse(expression.raw);

        if (expression.value instanceof Function)
        {
            chai.expect((result.evaluate(expression.scope) as Function).toString(), "evaluate").to.deep.equal(expression.value.toString());
            chai.expect((result.evaluate(expression.scope, true) as Function).toString(), "evaluate using cache").to.deep.equal(expression.value.toString());
        }
        else
        {
            chai.expect(result.evaluate(expression.scope), "evaluate").to.deep.equal(expression.value);
            chai.expect(result.evaluate(expression.scope, true), "evaluate using cache").to.deep.equal(expression.value);
        }

        chai.expect(result, "instanceof").instanceof(expression.type);
        chai.expect(result.toString(), "toString").to.equal(expression.toString);
    }

    @shouldFail
    @batchTest(invalidExpressions, x => `Expression (${x.raw}) should throw ${x.error.message}`)
    public expressionsShouldThrow(expression: InvalidExpressionFixtureSpec): void
    {
        try
        {
            Parser.parse(expression.raw);

            throw new Error(`Expression (${expression.raw}) not throw`);
        }
        catch (error)
        {
            chai.expect(error.message).to.equal(expression.error.message);
            chai.expect(error).to.includes(expression.error);
        }
    }
}