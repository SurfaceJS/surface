import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import CancelationTokenSource      from "../internal/cancellation-token-source";

@suite
export default class CancelationTokenSourceSpec
{
    @test @shouldPass
    public abort(): void
    {
        const source = new CancelationTokenSource();

        assert.equal(source.token.canceled, false);

        source.cancel();

        assert.equal(source.token.canceled, true);
    }
}