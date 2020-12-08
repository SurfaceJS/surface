import { batchTest, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                             from "chai";
import Expression                             from "../internal/expression.js";
import RegExpLiteral                          from "../internal/expressions/reg-exp-literal.js";
import { validVisitors }                      from "./expectations/expression-visitor-expected.js";
import FixtureVisitor                         from "./fixtures/fixture-visitor.js";

@suite
export default class ExpressionVisitorSpec
{
    @shouldPass
    @batchTest(validVisitors, x => `${x.raw}; visit ${x.value}`)
    public visitsShouldWork(spec: { raw: string, value: string }): void
    {
        const expression = Expression.parse(spec.raw);
        const visitor  = new FixtureVisitor();

        visitor.visit(expression);

        expect(visitor.toString()).to.equal(spec.value);
    }

    @test @shouldPass
    public visitRegExpLiteral(): void
    {
        const visitor = new FixtureVisitor();

        visitor.visit(new RegExpLiteral("\\d", "i"));

        expect(visitor.toString()).to.equal("RegExpLiteral");
    }
}