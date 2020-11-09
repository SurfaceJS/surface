/* eslint-disable require-atomic-updates */
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                         from "chai";
import chaiAsPromised                          from "chai-as-promised";
import ChangeTracker                           from "../internal/change-tracker";
import ParallelWorker from "../internal/parallel-worker";
import Watcher from "../internal/watcher";

use(chaiAsPromised);

@suite
export default class ChangeTrackerSpec
{
    @test @shouldPass
    public async observe(): Promise<void>
    {
        const changeTracker = new ChangeTracker(0);

        changeTracker.start();

        const target = { child: { value: 1 },  value: 1 };

        let valueReceiver1     = 0;
        let valueReceiver2     = 0;
        let childReceiver      = { value: 0 };
        let childValueReceiver = 0;

        const childWatcher      = new Watcher(target, ["child"]);
        const childValueWatcher = new Watcher(target, ["child", "value"]);
        const value1Watcher     = new Watcher(target, ["value"]);
        const value2Watcher     = new Watcher(target, ["value"]);

        childWatcher.observer.subscribe(x => childReceiver = x as typeof childReceiver);
        childValueWatcher.observer.subscribe(x => childValueReceiver = x as typeof childValueReceiver);
        value1Watcher.observer.subscribe(x => valueReceiver1 = x as typeof valueReceiver1);
        value2Watcher.observer.subscribe(x => valueReceiver2 = x as typeof valueReceiver2);

        changeTracker.attach(childWatcher);
        changeTracker.attach(childValueWatcher);
        changeTracker.attach(value1Watcher);
        changeTracker.attach(value2Watcher);

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(target.child, childReceiver);
        assert.equal(target.child.value, childValueReceiver);
        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        target.child = { value: 2 };
        target.value = 2;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(target.child, childReceiver);
        assert.equal(target.child.value, childValueReceiver);
        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        changeTracker.stop();

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.isOk(true);
    }

    @test @shouldPass
    public async observeTwoWay(): Promise<void>
    {
        const changeTracker = new ChangeTracker(0);

        changeTracker.start();
        changeTracker.start(); // Coverage

        const left  = { value: 1 };
        const right = { value: 2 };

        const leftWatcher  = new Watcher(left, ["value"]);
        const rightWatcher = new Watcher(right, ["value"]);

        leftWatcher.observer.subscribe(x => right.value = x as number);
        rightWatcher.observer.subscribe(x => left.value = x as number);

        changeTracker.attach(rightWatcher);
        changeTracker.attach(leftWatcher);

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(left.value, right.value);

        left.value = 3;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(left.value, right.value);

        right.value = 4;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(left.value, right.value);

        left.value = 3;
        right.value = 5;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(right.value, 5);
        assert.equal(left.value, right.value);

        right.value = 6;
        left.value = 2;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(right.value, 6);
        assert.equal(left.value, right.value);

        changeTracker.stop();
        changeTracker.clear(); // Coverage
    }

    @test @shouldPass
    public async unsubscribe(): Promise<void>
    {
        const changeTracker = new ChangeTracker(0);

        changeTracker.start();

        const target = { value: 1 };

        let valueReceiver1 = 0;
        let valueReceiver2 = 0;

        const watcher = new Watcher(target, ["value"]);

        const subscription1 = watcher.observer.subscribe(x => valueReceiver1 = x as typeof valueReceiver1);
        const subscription2 = watcher.observer.subscribe(x => valueReceiver2 = x as typeof valueReceiver2);

        changeTracker.attach(watcher);

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        changeTracker.dettach(watcher);

        target.value = 2;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.notEqual(target.value, valueReceiver1);
        assert.notEqual(target.value, valueReceiver2);

        changeTracker.attach(watcher);

        subscription1.unsubscribe();
        subscription2.unsubscribe();

        target.value = 3;

        await changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        assert.notEqual(target.value, valueReceiver1);
        assert.notEqual(target.value, valueReceiver2);

        changeTracker.stop();
    }

    @test @shouldFail
    public async detectChangesError(): Promise<void>
    {
        const changeTracker = new ChangeTracker(0);

        changeTracker.start();

        const watcher = new Watcher({ value: 1 }, ["x", "y", "x"]);

        changeTracker.attach(watcher);

        await assert.isFulfilled(changeTracker.nextCicle().then(async () => ParallelWorker.whenDone()));

        watcher.observer.subscribe(() => void 0);

        await assert.isRejected(changeTracker.nextCicle().then(async () => ParallelWorker.whenDone()), "Property \"x\" does not exists on type Object", "changeTracker.nextCicle() isRejected");

        changeTracker.stop();
    }

    @test @shouldFail
    public async workerError(): Promise<void>
    {
        const changeTracker = new ChangeTracker(0);

        changeTracker.start();

        const watcher = new Watcher({ value: 1 }, ["value"]);

        // eslint-disable-next-line max-statements-per-line
        watcher.observer.subscribe(() => { throw new Error("Some error"); });

        changeTracker.attach(watcher);

        const promise = changeTracker.nextCicle().then(async () => ParallelWorker.whenDone());

        await assert.isRejected(promise, "Some error", "changeTracker.nextCicle() isRejected");

        changeTracker.stop();
    }
}