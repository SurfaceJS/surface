import { batchTest, shouldPass, suite } from "@surface/test-suite";
import chai                             from "chai";
import PatternMatcher                   from "../internal/pattern-matcher.js";
import { type Scenario, scenarios }     from "./pattern-matcher.expectations.js";
import { scenarios as rangeScenarios }  from "./pattern-matcher.ranges.expectations.js";

@suite
export default class PatternMatcherSpec
{
    @shouldPass
    @batchTest([...scenarios, ...rangeScenarios], x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and unmatches: [${x.unmatches.join(", ")}]`, x => x.skip)
    public parsePatternPath(scenario: Scenario): void
    {
        const regex = PatternMatcher.parse(scenario.pattern);

        // chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

        for (const path of scenario.matches)
        {
            chai.assert.isTrue(regex.test(path), `regex.test("${path}") should be true`);
        }

        for (const path of scenario.unmatches)
        {
            chai.assert.isFalse(regex.test(path), `regex.test("${path}") should be false`);
        }

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");
    }
}
