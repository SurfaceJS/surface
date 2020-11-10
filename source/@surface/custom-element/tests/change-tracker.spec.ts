/* eslint-disable require-atomic-updates */
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { afterEach, beforeEach, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }             from "chai";
import chaiAsPromised              from "chai-as-promised";
import ChangeTracker               from "../internal/change-tracker";
import Scheduler                   from "../internal/scheduler";
import Watcher                     from "../internal/watcher";

use(chaiAsPromised);

@suite
export default class ChangeTrackerSpec
{
    private readonly changeTracker: ChangeTracker;
    private readonly scheduler:     Scheduler;

    public constructor()
    {
        this.scheduler     = new Scheduler(0);
        this.changeTracker = new ChangeTracker(this.scheduler, 0);
    }

    private async whenDone(): Promise<void>
    {
        await this.changeTracker.nextCicle();
        await this.scheduler.whenDone();
    }

    @beforeEach
    public beforeEach(): void
    {
        this.changeTracker.start();
    }

    @afterEach
    public afterEach(): void
    {
        this.changeTracker.stop();
        this.changeTracker.clear();
    }

    @test @shouldPass
    public async observe(): Promise<void>
    {
        this.changeTracker.start(); // Coverage

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

        this.changeTracker.attach(childWatcher);
        this.changeTracker.attach(childValueWatcher);
        this.changeTracker.attach(value1Watcher);
        this.changeTracker.attach(value2Watcher);

        await this.whenDone();

        assert.notEqual(target.child, childReceiver);
        assert.notEqual(target.child.value, childValueReceiver);
        assert.notEqual(target.value, valueReceiver1);
        assert.notEqual(target.value, valueReceiver2);

        target.child = { value: 2 };
        target.value = 2;

        await this.whenDone();

        assert.equal(target.child, childReceiver);
        assert.equal(target.child.value, childValueReceiver);
        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        this.changeTracker.stop();

        await this.whenDone();

        assert.isOk(true);
    }

    @test @shouldPass
    public async observeTwoWay(): Promise<void>
    {
        const left  = { value: 1 };
        const right = { value: 2 };

        const leftWatcher  = new Watcher(left, ["value"]);
        const rightWatcher = new Watcher(right, ["value"]);

        leftWatcher.observer.subscribe(x => right.value = x as number);
        rightWatcher.observer.subscribe(x => left.value = x as number);

        this.changeTracker.attach(rightWatcher);
        this.changeTracker.attach(leftWatcher);

        await this.whenDone();

        assert.notEqual(left.value, right.value);

        left.value = 3;

        await this.whenDone();

        assert.equal(left.value, right.value);

        right.value = 4;

        await this.whenDone();

        assert.equal(left.value, right.value);

        left.value = 3;
        right.value = 5;

        await this.whenDone();

        assert.equal(right.value, 5);
        assert.equal(left.value, right.value);

        right.value = 6;
        left.value = 2;

        await this.whenDone();

        assert.equal(right.value, 6);
        assert.equal(left.value, right.value);

        this.changeTracker.stop();
        this.changeTracker.clear(); // Coverage
    }

    @test @shouldPass
    public async unsubscribe(): Promise<void>
    {
        this.changeTracker.start();

        const target = { value: 0 };

        let valueReceiver1 = 0;
        let valueReceiver2 = 0;

        const watcher = new Watcher(target, ["value"]);

        target.value = 1;

        const subscription1 = watcher.observer.subscribe(x => valueReceiver1 = x as typeof valueReceiver1);
        const subscription2 = watcher.observer.subscribe(x => valueReceiver2 = x as typeof valueReceiver2);

        this.changeTracker.attach(watcher);

        await this.whenDone();

        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        this.changeTracker.dettach(watcher);

        target.value = 2;

        await this.whenDone();

        assert.notEqual(target.value, valueReceiver1);
        assert.notEqual(target.value, valueReceiver2);

        this.changeTracker.attach(watcher);

        subscription1.unsubscribe();
        subscription2.unsubscribe();

        target.value = 3;

        await this.whenDone();

        assert.notEqual(target.value, valueReceiver1);
        assert.notEqual(target.value, valueReceiver2);
    }
}