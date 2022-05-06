import { batchTest, suite }                                       from "@surface/test-suite";
import chai                                                       from "chai";
import TokenType                                                  from "../internal/enums/token-type.js";
import Scanner                                                    from "../internal/scanner.js";
import { type ScannerValidExpectation, scannerValidExpectations } from "./scanner-expectations.js";

@suite
export default class RouteSpec
{
    @batchTest(scannerValidExpectations, x => `Source: "${x.source}" should scan: "${TokenType[x.token.type]}"`)
    public scanner(expected: ScannerValidExpectation): void
    {
        const scanner = new Scanner(expected.source);

        const actual = scanner.nextToken();

        chai.assert.deepEqual(actual, expected.token);
    }
}