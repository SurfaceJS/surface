import { batchTest, category, suite } from "@surface/test-suite";
import { expect }                     from "chai";
import Expression                     from "..";
import FixtureVisitor                 from "./fixtures/fixture-visitor";
import { validVisitors }              from "./fixtures/visitors";

@suite("Expression Visitor")
export default class ExpressionVisitorSpec
{
    @category("Visits should work")
    @batchTest(validVisitors, x => `Visit ${x.value}`)
    public visitsShouldWork(spec: { raw: string, value: string, context?: Object }): void
    {
        const visitor  = new FixtureVisitor();
        let expression = Expression.from(spec.raw, spec.context);

        expect(visitor.visit(expression).evaluate()).to.equal(spec.value);
    }
}