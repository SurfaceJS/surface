import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import CancellationTokenSource     from "../internal/cancellation-token-source.js";

@suite
export default class CancellationTokenSourceSpec
{
    @test @shouldPass
    public abort(): void
    {
        const source = new CancellationTokenSource();

        chai.assert.equal(source.token.canceled, false);

        source.cancel();

        chai.assert.equal(source.token.canceled, true);
    }
}