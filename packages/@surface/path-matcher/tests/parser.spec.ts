import { batchTest, shouldPass, suite }       from "@surface/test-suite";
import chai                                   from "chai";
import PathMatcher                            from "../internal/path-matcher.js";
import { type Scenario, scenarios }           from "./parser.scn.js";
import { type SplitScenario, splitScenarios } from "./parser.split.scn.js";

@suite
export default class PatternMatcherSpec
{
    @shouldPass
    @batchTest(scenarios, x => `Expects "${x.source}" ${x.options ? `with options: ${JSON.stringify(x.options)}` : ""} matches: [${x.matches.join(", ")}] and mismatches: [${x.mismatches.join(", ")}]`, x => x.skip)
    public makeRegex(scenario: Scenario): void
    {
        const regex = PathMatcher.makeRegex(scenario.source, scenario.options);

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

        for (const path of scenario.matches)
        {
            chai.assert.isTrue(regex.test(path), `regex.test("${path}") should be true`);
        }

        for (const path of scenario.mismatches)
        {
            chai.assert.isFalse(regex.test(path), `regex.test("${path}") should be false`);
        }

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");
    }

    @shouldPass
    @batchTest(splitScenarios, x => `Expects "${x.source}" splits to base: "${x.expected.path}" and pattern: "${x.expected.pattern}"`, x => x.skip)
    public split(scenario: SplitScenario): void
    {
        const actual = PathMatcher.split(scenario.source);

        chai.assert.deepEqual(actual, scenario.expected);
    }
}
