import { batchTest, shouldFail, shouldPass, suite }              from "@surface/test-suite";
import chai                                                      from "chai";
import Parser                                                    from "../internal/parser.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { ParserInvalidExpectation, ParserValidExpectation } from "./parser-expectations.js";
import { invalidExpectations, validExpectations }                from "./parser-expectations.js";

@suite
export default class ParserSpec
{
    @shouldPass
    @batchTest(validExpectations, x => `Pattern: "${x.pattern}" should parse: "${x.expected}"`)
    public validParse(expected: ParserValidExpectation): void
    {
        const actual = Parser.parse(expected.pattern);

        chai.assert.deepEqual(actual, expected.expected);
    }

    @shouldFail
    @batchTest(invalidExpectations, x => `Pattern: "${x.pattern}" should throws: "${x.error.message}"`)
    public invalidParse(expected: ParserInvalidExpectation): void
    {
        chai.assert.throws(() => Parser.parse(expected.pattern), Error, expected.error.message);
    }
}