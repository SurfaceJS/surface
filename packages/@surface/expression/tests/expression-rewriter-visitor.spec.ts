import { batchTest, shouldPass, suite, test } from "@surface/test-suite";
import chai                                   from "chai";
import Expression                             from "../internal/expression.js";
import RegExpLiteral                          from "../internal/expressions/reg-exp-literal.js";
import { validVisitors }                      from "./expression-visitor-expectations.js";
import FixtureExpressionRewriterVisitor       from "./fixtures/fixture-expression-rewriter-visitor.js";

@suite
export default class ExpressionVisitorSpec
{
    @shouldPass
    @batchTest(validVisitors, x => `${x.raw}; visit ${x.value}`)
    public visitsShouldWork(spec: { raw: string, value: string }): void
    {
        const expression = Expression.parse(spec.raw);
        const visitor    = new FixtureExpressionRewriterVisitor();

        visitor.visit(expression);

        chai.assert.equal(visitor.toString(), spec.value);
    }

    @test @shouldPass
    public visitRegExpLiteral(): void
    {
        const visitor = new FixtureExpressionRewriterVisitor();

        visitor.visit(new RegExpLiteral("\\d", "i"));

        chai.assert.equal(visitor.toString(), "RegExpLiteral");
    }
}