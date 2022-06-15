import { batchTest, shouldPass, suite }                                from "@surface/test-suite";
import chai                                                            from "chai";
import PatternMatcher                                                  from "../internal/pattern-matcher.js";
import { type Scenario as RangeScenario, scenarios as rangeScenarios } from "./pattern-matcher.ranges.scn.js";
import { type Scenario, scenarios }                                    from "./pattern-matcher.scn.js";

@suite
export default class PatternMatcherSpec
{
    @shouldPass
    @batchTest(scenarios, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and mismatches: [${x.mismatches.join(", ")}]`, x => x.skip)
    public parsePatternPath(scenario: Scenario): void
    {
        const regex = PatternMatcher.parse(scenario.pattern);

        // chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

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
    @batchTest(rangeScenarios, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and mismatches: [${x.mismatches.join(", ")}]`, x => x.skip)
    public parsePatternRange(scenario: RangeScenario): void
    {
        const regex = PatternMatcher.parse(scenario.pattern);

        // chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");

        for (const path of scenario.matches)
        {
            chai.assert.isTrue(regex.test(String(path)), `regex.test("${path}") should be true`);
        }

        for (const path of scenario.mismatches)
        {
            chai.assert.isFalse(regex.test(String(path)), `regex.test("${path}") should be false`);
        }

        // !!! Don't commit this uncomented !!!
        // const [min, max, interval = 1] = scenario.pattern.substring(1, scenario.pattern.length - 1).split("..").map(Number) as [number, number, number];
        // const offsetMin      = min == 0 ? -10 : Math.round(min * -13 / 10) * 10;
        // const offsetMax      = max * 13;
        // const offsetInterval = interval;

        // for (let value = offsetMin; value < offsetMax; value += offsetInterval)
        // {
        //     const inRange = value >= min && value <= max;

        //     chai.assert.isTrue(regex.test(String(value)) == inRange, `regex.test("${value}") should be ${inRange}`);
        // }

        chai.assert.deepEqual(regex, scenario.regex, "regex deep equal to expectation.regex");
    }
}
