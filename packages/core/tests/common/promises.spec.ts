import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                         from "chai";
import chaiAsPromised                          from "chai-as-promised";
import CancellationTokenSource                 from "../../internal/cancellation-token-source.js";
import { runAsync }                            from "../../internal/common/promises.js";

use(chaiAsPromised);

@suite
export default class PromisesSpec
{
    @test @shouldPass
    public async fireAsync(): Promise<void>
    {
        const promise1 = runAsync(() => void 0, 10);

        await assert.isFulfilled(promise1);

        const promise2 = runAsync(async () => Promise.resolve(), 10);

        await assert.isFulfilled(promise2);
    }

    @test @shouldFail
    public async fireAsyncAndThrow(): Promise<void>
    {
        // eslint-disable-next-line max-statements-per-line
        const promise = runAsync(() => { throw new Error("Some error"); }, 10);

        await assert.isRejected(promise, "Some error");
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
