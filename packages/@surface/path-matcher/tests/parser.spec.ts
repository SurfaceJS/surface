import { batchTest, shouldPass, suite }       from "@surface/test-suite";
import chai                                   from "chai";
import PathMatcher                            from "../internal/path-matcher.js";
import { type RangeScenario, rangeScenarios } from "./parser.ranges.scn.js";
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
    @batchTest(rangeScenarios, x => `Expects "${x.source}" matches: [${x.matches.join(", ")}] and mismatches: [${x.mismatches.join(", ")}]`, x => x.skip)
    public parseRanges(scenario: RangeScenario): void
    {
        const regex = PathMatcher.makeRegex(scenario.source);

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

        // !!! Don't commit this uncomented !!!
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

    @shouldPass
    @batchTest(splitScenarios, x => `Expects "${x.source}" splits to base: "${x.expected.base}" and pattern: "${x.expected.pattern}"`, x => x.skip)
    public split(scenario: SplitScenario): void
    {
        const actual = PathMatcher.split(scenario.source);

        chai.assert.deepEqual(actual, scenario.expected);
    }
}
