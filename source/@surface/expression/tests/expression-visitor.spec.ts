import { batchTest, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                             from "chai";
import Expression                             from "..";
import RegExpLiteral                          from "../internal/expressions/reg-exp-literal";
import { validVisitors }                      from "./expectations/expression-visitor-expected";
import FixtureVisitor                         from "./fixtures/fixture-visitor";

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