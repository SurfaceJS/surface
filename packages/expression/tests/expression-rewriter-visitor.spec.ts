import { batchTest, shouldPass, suite } from "@surface/test-suite";
import { assert }                       from "chai";
import Parser                           from "../internal/parser.js";
import { validVisitors }                from "./expression-visitor-expectations.js";
import FixtureExpressionRewriterVisitor from "./fixtures/fixture-expression-rewriter-visitor.js";

@suite
export default class ExpressionVisitorSpec
{
    @shouldPass
    @batchTest(validVisitors, x => `${x.raw}; visit ${x.value}`)
    public visitsShouldWork(spec: { raw: string, value: string }): void
    {
        const expression = Parser.parse(spec.raw);
        const visitor    = new FixtureExpressionRewriterVisitor();

        visitor.visit(expression);

        assert.equal(visitor.toString(), spec.value);
    }
}
