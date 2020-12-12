import chai                                            from "chai";
import { batchTest, shouldPass, suite }                from "../../source/@surface/test-suite/index.js";
import { parsePatternPath }                            from "../internal/common.js";
import type { CommonParsePatternPathValidExpectation } from "./common-expectations.js";
import { validExpectations }                           from "./common-expectations.js";

@suite
export default class CommonSpec
{
    @shouldPass
    @batchTest(validExpectations, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and unmatches: [${x.unmatches.join(", ")}]`)
    public parse(expectation: CommonParsePatternPathValidExpectation): void
    {
        const regex = parsePatternPath(expectation.pattern);

        chai.assert.deepEqual(regex, expectation.regex, "regex deep equal to expectation.regex");

        for (const path of expectation.matches)
        {
            chai.assert.isTrue(regex.test(path), `regex.test(path).test("${path}") is true`);
        }

        for (const path of expectation.unmatches)
        {
            chai.assert.isFalse(regex.test(path), `regex.test(path).test("${path}") is false`);
        }
    }
}