import { batchTest, shouldPass, suite }           from "@surface/test-suite";
import { assert }                                 from "chai";
import PathMatcher                                from "../internal/path-matcher.js";
import { type ResolveScenario, resolveScenarios } from "./path-matcher.resolve.scn.js";

@suite
export default class PatternMatcherSpec
{
    @shouldPass
    @batchTest(resolveScenarios, x => `Expects base: "${x.base}" and pattern: "${x.pattern}" resolves to ${x.fullPattern}`, x => x.skip)
    public resolve(scenario: ResolveScenario): void
    {
        assert.equal(PathMatcher.resolve(scenario.base, scenario.pattern, { unix: scenario.unix }).fullPattern, scenario.fullPattern);
    }
}
