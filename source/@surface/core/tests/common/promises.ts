import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import CancellationTokenSource                 from "../../internal/cancellation-token-source";
import { fireAsync }                           from "../../internal/common/promises";

@suite
export default class PromisesSpec
{
    @test @shouldPass
    public async fireAsync(): Promise<void>
    {
        const now = Date.now();

        await fireAsync(() => void 0, 10);

        const expended = Date.now() - now;

        assert.isTrue(expended >= 10);
    }

    @test @shouldPass
    public async fireAsyncWithCancellationToken(): Promise<void>
    {
        const now = Date.now();

        const cancellationTokenSource = new CancellationTokenSource();

        const promise = fireAsync(() => void 0, 10, cancellationTokenSource.token);

        cancellationTokenSource.cancel();

        await promise;

        const expended = Date.now() - now;

        assert.isTrue(expended < 10);
    }

    @test @shouldFail
    public failingTest(): void
    {
        assert.isNotOk(false);
    }
}