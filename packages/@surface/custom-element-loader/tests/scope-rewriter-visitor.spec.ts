import Expression                       from "@surface/expression";
import { batchTest, shouldPass, suite } from "@surface/test-suite";
import chai                             from "chai";
import ScopeRewriterVisitor             from "../internal/scope-rewriter-visitor.js";
import scopeRewriterVisitorSeed         from "./scope-rewriter-visitor-seed.spec.js";

@suite
export default class SourceGeneratorSpec
{
    @shouldPass
    @batchTest(scopeRewriterVisitorSeed, x => `Expression: "${x.source}" should be rewrited to: "${x.expected}"`)
    public expressionFactory(seed: (typeof scopeRewriterVisitorSeed)[number]): void
    {
        const expression = Expression.parse(seed.source);
        const actual     = ScopeRewriterVisitor.rewrite(expression).toString();

        chai.assert.equal(actual, seed.expected);
    }
}