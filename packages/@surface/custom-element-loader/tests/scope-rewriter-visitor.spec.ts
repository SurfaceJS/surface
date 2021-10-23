import type { IArrowFunctionExpression } from "@surface/expression";
import Expression                        from "@surface/expression";
import { batchTest, shouldPass, suite }  from "@surface/test-suite";
import chai                              from "chai";
import ScopeRewriterVisitor              from "../internal/scope-rewriter-visitor.js";
import { expressionsSeed, patternSeeds } from "./scope-rewriter-visitor-seed.spec.js";

@suite
export default class SourceGeneratorSpec
{
    @shouldPass
    @batchTest(expressionsSeed, x => `Expression: "${x.source}" should be rewrited to: "${x.expected}"`)
    public rewrite(seed: (typeof expressionsSeed)[number]): void
    {
        const expression = Expression.parse(seed.source);
        const actual     = ScopeRewriterVisitor.rewriteExpression(expression).toString();

        chai.assert.equal(actual, seed.expected);
    }

    @shouldPass
    @batchTest(patternSeeds, x => `Pattern: "${x.source}" should be rewrited to: "${x.expected}"`)
    public collectScope(seed: (typeof patternSeeds)[number]): void
    {
        const expression = Expression.parse(`(${seed.source}) => 0`) as IArrowFunctionExpression;
        const actual     = ScopeRewriterVisitor.collectScope(expression.parameters[0]).toString();

        chai.assert.equal(actual, seed.expected);
    }
}