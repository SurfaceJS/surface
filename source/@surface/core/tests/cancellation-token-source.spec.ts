import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import CancellationTokenSource      from "../internal/cancellation-token-source";

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