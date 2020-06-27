import { batchTest, suite }                                  from "@surface/test-suite";
import { assert }                                            from "chai";
import TokenType                                             from "../internal/enums/token-type";
import Scanner                                               from "../internal/scanner";
import { scannerValidExpectations, ScannerValidExpectation } from "./scanner-expectations";

@suite
export default class RouteSpec
{
    @batchTest(scannerValidExpectations, x => `Source: "${x.source}" should scan: "${TokenType[x.token.type]}"`)
    public scanner(expected: ScannerValidExpectation): void
    {
        const scanner = new Scanner(expected.source);

        const actual = scanner.nextToken();

        assert.deepEqual(actual, expected.token);
    }
}