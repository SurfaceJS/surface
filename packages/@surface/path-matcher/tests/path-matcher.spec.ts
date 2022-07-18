import { batchTest, shouldPass, suite }           from "@surface/test-suite";
import chai                                       from "chai";
import PathMatcher                                from "../internal/path-matcher.js";
import { type ResolveScenario, resolveScenarios } from "./path-matcher.resolve.scn.js";

@suite
export default class PatternMatcherSpec
{
    @shouldPass
    @batchTest(resolveScenarios, x => `Expects base: "${x.base}" and pattern: "${x.pattern}" resolves to ${x.expected}`, x => x.skip)
    public resolve(scenario: ResolveScenario): void
    {
        chai.assert.equal(PathMatcher.resolve(scenario.base, scenario.pattern).fullPattern, scenario.expected);
    }
}
