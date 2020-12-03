import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                         from "chai";
import chaiAsPromised                          from "chai-as-promised";
import CancellationTokenSource                 from "../../internal/cancellation-token-source";
import { runAsync }                            from "../../internal/common/promises";

use(chaiAsPromised);

@suite
export default class PromisesSpec
{
    @test @shouldPass
    public async fireAsync(): Promise<void>
    {
        const now = Date.now();

        await runAsync(() => void 0, 10);

        const expended = Date.now() - now;

        assert.isTrue(expended >= 10);
    }

    @test @shouldFail
    public async fireAsyncWithCancellationToken(): Promise<void>
    {
        const cancellationTokenSource = new CancellationTokenSource();

        const promise = runAsync(() => void 0, 10, cancellationTokenSource.token);

        cancellationTokenSource.cancel();

        await assert.isRejected(promise, "Task was canceled");
    }
}