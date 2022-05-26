import { batchTest, shouldPass, suite }  from "@surface/test-suite";
import chai                              from "chai";
import parsePatternPath                  from "../internal/parse-pattern-path.js";
import { type Scenario, validScenarios } from "./parse-pattern-path.expectations.js";

@suite
export default class ParsePatternPathSpec
{
    @shouldPass
    @batchTest(validScenarios, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and unmatches: [${x.unmatches.join(", ")}]`)
    public parsePatternPath(scenario: Scenario): void
    {
        const regex = parsePatternPath(scenario.pattern);

        for (const path of scenario.matches)
        {
            chai.assert.isTrue(regex.test(path), `regex.test("${path}") is true`);
        }

        for (const path of scenario.unmatches)
        {
            chai.assert.isFalse(regex.test(path), `regex.test("${path}") is false`);
        }

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");
    }
}
