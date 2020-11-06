/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable max-statements-per-line */
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                         from "chai";
import chaiAsPromised                          from "chai-as-promised";
import CancellationTokenSource                 from "../internal/cancellation-token-source";
import ParallelWorker                          from "../internal/parallel-worker";

use(chaiAsPromised);

@suite
export default class ParallelWorkerSpec
{
    @test @shouldPass
    public run(): void
    {
        const worker = new ParallelWorker();

        const promise1 = worker.run(() => false);
        const promise2 = worker.run(() => true);

        const done = worker.done();

        assert.becomes(promise1, false);
        assert.becomes(promise2, true);
        assert.isFulfilled(done);
    }

    @test @shouldPass
    public async runWithCancelationToken(): Promise<void>
    {
        const worker = new ParallelWorker();

        const cancelationTokenSource = new CancellationTokenSource();

        const promise = worker.run(() => true, cancelationTokenSource.token);

        cancelationTokenSource.cancel();

        const executed = await promise;

        assert.isNull(executed);
    }

    @test @shouldFail
    public failingTest(): void
    {
        const worker = new ParallelWorker();

        const promise1 = worker.run(() => false);
        const promise2 = worker.run((): void => { throw new Error(); });
        const promise3 = worker.run(() => true);

        const done = worker.done();

        assert.becomes(promise1, false);
        assert.isRejected(promise2);
        assert.becomes(promise3, true);
        assert.isRejected(done);
    }
}