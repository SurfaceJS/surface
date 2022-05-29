import { batchTest, shouldPass, suite } from "@surface/test-suite";
import chai                             from "chai";
import FileExpansionParser              from "../internal/file-expansion-parser.js";
import { type Scenario, scenarios }     from "./file-expansion-parser.expectations.js";

@suite
export default class FileExpansionParserSpec
{
    @shouldPass
    @batchTest(scenarios, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and unmatches: [${x.unmatches.join(", ")}]`, x => x.skip)
    public parsePatternPath(scenario: Scenario): void
    {
        const regex = FileExpansionParser.parse(scenario.pattern);

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
