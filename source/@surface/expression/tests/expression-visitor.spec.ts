import { batchTest, shouldPass, suite } from "@surface/test-suite";
import { expect }                       from "chai";
import Expression                       from "..";
import FixtureVisitor                   from "./fixtures/fixture-visitor";
import { validVisitors }                from "./fixtures/visitors";

@suite
export default class ExpressionVisitorSpec
{
    @shouldPass
    @batchTest(validVisitors, x => `visit ${x.value}`)
    public visitsShouldWork(spec: { raw: string, value: string, context?: Object }): void
    {
        const visitor  = new FixtureVisitor();
        let expression = Expression.from(spec.raw, spec.context);

        expect(visitor.visit(expression).evaluate()).to.equal(spec.value);
    }
}