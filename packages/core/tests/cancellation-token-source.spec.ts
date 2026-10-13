import { assert, shouldPass, suite, test } from "@surface/test-suite";
import CancellationTokenSource     from "../internal/cancellation-token-source.js";

@suite
export default class CancellationTokenSourceSpec
{
    @test @shouldPass
    public abort(): void
    {
        const source = new CancellationTokenSource();

        assert.equal(source.token.canceled, false);

        source.cancel();

        assert.equal(source.token.canceled, true);
    }
}
