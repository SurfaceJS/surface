import type { ArrowFunctionExpression }  from "@surface/expression";
import { Parser }                        from "@surface/expression";
import { batchTest, shouldPass, suite }  from "@surface/test-suite";
import { assert }                        from "chai";
import ScopeRewriterVisitor              from "../internal/scope-rewriter-visitor.js";
import { expressionsSeed, patternSeeds } from "./scope-rewriter-visitor-seed.spec.js";

@suite
export default class SourceGeneratorSpec
{
    @shouldPass
    @batchTest(expressionsSeed, x => `Expression: "${x.source}" should be rewrited to: "${x.expected}"`)
    public rewrite(seed: (typeof expressionsSeed)[number]): void
    {
        const expression = Parser.parse(seed.source);
        const actual     = ScopeRewriterVisitor.rewriteExpression(expression).toString();

        assert.equal(actual, seed.expected);
    }

    @shouldPass
    @batchTest(patternSeeds, x => `Pattern: "${x.source}" should be rewrited to: "${x.expected}"`)
    public collectScope(seed: (typeof patternSeeds)[number]): void
    {
        const expression = Parser.parse(`(${seed.source}) => 0`) as ArrowFunctionExpression;
        const actual     = ScopeRewriterVisitor.collectScope(expression.parameters[0]!).toString();

        assert.equal(actual, seed.expected);
    }
}
