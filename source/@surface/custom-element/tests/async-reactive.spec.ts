// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import AsyncReactive               from "../internal/async-reactive";
import Scheduler                   from "../internal/scheduler";

@suite
export default class AsyncReactiveSpec
{
    @test @shouldPass
    public async observe(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        const target = { value: 1 };

        let asyncReceiver = target.value;

        AsyncReactive.from(target, ["value"], scheduler).subscribe(() => void 0); // Coverage
        AsyncReactive.from(target, ["value"], scheduler).subscribe(x => asyncReceiver = x as number);

        assert.equal(target.value, asyncReceiver);

        target.value = 2;

        await scheduler.whenDone();

        assert.equal(target.value, asyncReceiver);
    }

    @test @shouldPass
    public observeSync(): void
    {
        const target = { value: 1 };

        let asyncReceiver = target.value;

        AsyncReactive.from(target, ["value"]).subscribe(x => asyncReceiver = x as number);

        assert.equal(target.value, asyncReceiver);

        target.value = 2;

        assert.equal(target.value, asyncReceiver);
    }

    @test @shouldPass
    public async observeDebounce(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        const target = { value: 1 };

        let receiver = target.value;
        let hits = 0;

        AsyncReactive.from(target, ["value"], scheduler).subscribe(x => (receiver = x as number, hits++));

        assert.equal(target.value, receiver);

        target.value = 2;
        target.value = 3;
        target.value = 5;

        await scheduler.whenDone();

        assert.equal(hits, 1);
        assert.equal(target.value, receiver);
    }

    @test @shouldPass
    public async observeHtmlElement(): Promise<void>
    {
        const scheduler = new Scheduler(0);

        const target = document.createElement("input");

        let hits     = 0;
        let receiver = target.value;
        let length   = target.value.length;

        AsyncReactive.from(target, ["value"], scheduler).subscribe(x => (receiver = x as string, hits++));
        AsyncReactive.from(target, ["value", "length"], scheduler).subscribe(x => length = x as number);

        assert.equal(target.value, receiver);

        target.value = "Hello World !!!";
        target.dispatchEvent(new Event("input"));

        await scheduler.whenDone();

        assert.equal(hits, 1);
        assert.equal(target.value, receiver);
        assert.equal(target.value.length, length);
    }
}