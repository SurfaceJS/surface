import { batchTest, shouldPass, suite }                from "@surface/test-suite";
import chai                                            from "chai";
import parsePatternPath                                from "../internal/parse-pattern-path.js";
import { validExpectations }                           from "./parse-pattern-path-expectations.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { CommonParsePatternPathValidExpectation } from "./parse-pattern-path-expectations.js";

@suite
export default class ParsePatternPathSpec
{
    @shouldPass
    @batchTest(validExpectations, x => `Expects "${x.pattern}" matches: [${x.matches.join(", ")}] and unmatches: [${x.unmatches.join(", ")}]`)
    public parsePatternPath(expectation: CommonParsePatternPathValidExpectation): void
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