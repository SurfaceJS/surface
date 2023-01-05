import { batchTest, shouldPass, suite }                     from "@surface/test-suite";
import chai                                                 from "chai";
import { parseAlphaRange, parseNumericRange }                                from "../internal/range-parser.js";
import
{
    type AlphaRangeScenario,
    type NumericRangeScenario,
    alphaRangesScenarios,
    numericRangeScenarios,
} from "./range-parser.scn.js";

@suite
export default class PatternMatcherSpec
{
    @shouldPass
    @batchTest(alphaRangesScenarios, x => `Expects "${x.source}" matches: [${x.matches.join(", ")}] and mismatches: [${x.mismatches.join(", ")}]`, x => x.skip)
    public parseAlphaRange(scenario: AlphaRangeScenario): void
    {
        const match = scenario.source.split("..");

        const regex = new RegExp(`^(?:${parseAlphaRange(match[0]!, match[1]!, Number(match[2] ?? "1"))})\$`);

        // chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

        for (const path of scenario.matches)
        {
            chai.assert.isTrue(regex.test(String(path)), `regex.test("${path}") should be true`);
        }

        for (const path of scenario.mismatches)
        {
            chai.assert.isFalse(regex.test(String(path)), `regex.test("${path}") should be false`);
        }

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");
    }

    @shouldPass
    @batchTest(numericRangeScenarios, x => `Expects "${x.source}" matches: [${x.matches.join(", ")}] and mismatches: [${x.mismatches.join(", ")}]`, x => x.skip)
    public parseNumericRange(scenario: NumericRangeScenario): void
    {
        const match = scenario.source.split("..");

        const regex = new RegExp(`^(?:${parseNumericRange(match[0]!, match[1]!, Number(match[2] ?? "1"))})\$`);

        // chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

        for (const path of scenario.matches)
        {
            chai.assert.isTrue(regex.test(String(path)), `regex.test("${path}") should be true`);
        }

        for (const path of scenario.mismatches)
        {
            chai.assert.isFalse(regex.test(String(path)), `regex.test("${path}") should be false`);
        }

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

        // !!! Don't commit this uncommented !!!
        // const [startRange, endRange, interval = "1"] = scenario.pattern.substring(1, scenario.pattern.length - 1).split("..") as [string, string, string?];

        // const getMinLength = (value: string): number =>
        // {
        //     const abs = value.replace("-", "");

        //     return abs.startsWith("0") ? abs.length : 1;
        // };

        // const minLength = Math.max(getMinLength(startRange), getMinLength(endRange));

        // const min = Number(startRange);
        // const max = Number(endRange);

        // const offsetMin      = min == 0 ? -10 : Math.round(min * -13 / 10) * 10;
        // const offsetMax      = max * 13;
        // const offsetInterval = Number(interval);

        // for (let value = offsetMin; value < offsetMax; value += offsetInterval)
        // {
        //     const inRange = value >= min && value <= max;

        //     chai.assert.isTrue(regex.test(String(value).padStart(minLength, "0")) == inRange, `regex.test("${value}") should be ${inRange}`);
        // }
    }
}
