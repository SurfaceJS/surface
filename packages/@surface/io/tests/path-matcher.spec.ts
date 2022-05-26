import { batchTest, shouldPass, suite }  from "@surface/test-suite";
import chai                              from "chai";
import PathMatcher                       from "../internal/path-matcher.js";
import { type Scenario, validScenarios } from "./path-matcher.expectations.js";

@suite
export default class PathMatcherSpec
{
    @batchTest(validScenarios, undefined, x => x.skip) @shouldPass
    public matches(scenario: Scenario): void
    {
        const matcher = new PathMatcher(scenario.patterns, "/");

        const actual: Scenario["expected"] = scenario.expected.map(x => ({ path: x.path, hasMatches: matcher.test(x.path) }));

        chai.assert.deepEqual(actual, scenario.expected);
    }
}