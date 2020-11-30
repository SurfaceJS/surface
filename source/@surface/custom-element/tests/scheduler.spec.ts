/* eslint-disable max-statements-per-line */
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { CancellationTokenSource }             from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                         from "chai";
import chaiAsPromised                          from "chai-as-promised";
import Scheduler                               from "../internal/scheduler";

use(chaiAsPromised);

@suite
export default class SchedulerSpec
{
    @test @shouldPass
    public async queue(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        const actual = await scheduler.enqueue(() => 1, "high");

        assert.equal(actual, 1);
    }

    @test @shouldPass
    public async queueWithCancellationToken(): Promise<void>
    {
        const scheduler               = new Scheduler(10);
        const cancellationTokenSource = new CancellationTokenSource();

        const promise = scheduler.enqueue(() => 1, "high", cancellationTokenSource.token);

        await assert.isFulfilled(promise);
    }

    @test @shouldPass
    public async queuePriority(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        const actual: string[] = [];
        const expected = ["high", "normal", "low"];

        void scheduler.enqueue(() => actual.push("low"), "low");
        void scheduler.enqueue(() => actual.push("normal"), "normal");
        void scheduler.enqueue(() => actual.push("high"), "high");

        await scheduler.whenDone();

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async queuePriorityChange(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        const actual = await scheduler.enqueue(async () => scheduler.enqueue(async () => scheduler.enqueue(() => true, "high"), "normal"), "low");

        assert.isTrue(actual);
    }

    @test @shouldFail
    public async taskWithError(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        await assert.isRejected(scheduler.enqueue(() => { throw new Error(); }, "high"));
    }

    @test @shouldFail
    public async schedulerWithMultiplesErrors(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        void scheduler.enqueue(() => { throw new Error(); }, "high");
        void scheduler.enqueue(() => { throw new Error(); }, "high");
        void scheduler.enqueue(() => { throw new Error(); }, "high");

        await assert.isRejected(scheduler.whenDone());
    }

    @test @shouldFail
    public async queueAndCancelTask(): Promise<void>
    {
        const scheduler               = new Scheduler(0);
        const cancellationTokenSource = new CancellationTokenSource();

        const promise = scheduler.enqueue(() => 1, "high", cancellationTokenSource.token);

        cancellationTokenSource.cancel();

        await assert.isRejected(promise);
    }
}