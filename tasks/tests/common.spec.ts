import { assert }                                                    from "chai";
import { batchTest, shouldPass, suite }                              from "../../source/@surface/test-suite";
import { parsePatternPath }                                          from "../internal/common";
import { CommonParsePatternPathValidExpectation, validExpectations } from "./common-expectations";

@suite
export default class CommonSpec
{
    @shouldPass
    @batchTest(validExpectations, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and unmatches: [${x.unmatches.join(", ")}]`)
    public parse(expectation: CommonParsePatternPathValidExpectation): void
    {
        const regex = parsePatternPath(expectation.pattern);

        assert.deepEqual(regex, expectation.regex, "regex deep equal to expectation.regex");

        for (const path of expectation.matches)
        {
            assert.isTrue(regex.test(path), `regex.test(path).test("${path}") is true`);
        }

        for (const path of expectation.unmatches)
        {
            assert.isFalse(regex.test(path), `regex.test(path).test("${path}") is false`);
        }
    }
}