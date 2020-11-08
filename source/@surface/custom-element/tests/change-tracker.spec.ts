/* eslint-disable require-atomic-updates */
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert, use }                         from "chai";
import chaiAsPromised                          from "chai-as-promised";
import ChangeTracker                           from "../internal/change-tracker";

use(chaiAsPromised);

@suite
export default class ChangeTrackerSpec
{
    @test @shouldPass
    public async observe(): Promise<void>
    {
        const changeTracker = new ChangeTracker();

        changeTracker.start();

        const target = { child: { value: 1 },  value: 1 };

        let valueReceiver1     = 0;
        let valueReceiver2     = 0;
        let childReceiver      = { value: 0 };
        let childValueReceiver = 0;

        changeTracker.observe(target, ["child"]).subscribe(x => childReceiver = x as typeof childReceiver);
        changeTracker.observe(target, ["child", "value"]).subscribe(x => childValueReceiver = x as typeof childValueReceiver);
        changeTracker.observe(target, ["value"]).subscribe(x => valueReceiver1 = x as typeof valueReceiver1);
        changeTracker.observe(target, ["value"]).subscribe(x => valueReceiver2 = x as typeof valueReceiver2);

        await changeTracker.nextTick();

        assert.equal(target.child, childReceiver);
        assert.equal(target.child.value, childValueReceiver);
        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        target.child = { value: 2 };
        target.value = 2;

        await changeTracker.nextTick();

        assert.equal(target.child, childReceiver);
        assert.equal(target.child.value, childValueReceiver);
        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        changeTracker.stop();

        await changeTracker.nextTick();

        assert.isOk(true);
    }

    @test @shouldPass
    public async observeTwoWay(): Promise<void>
    {
        const changeTracker = new ChangeTracker();

        changeTracker.start();
        changeTracker.start(); // Coverage

        const left  = { value: 1 };
        const right = { value: 2 };

        changeTracker.observe(right, ["value"]).subscribe(x => left.value = x as number);
        changeTracker.observe(left, ["value"]).subscribe(x => right.value = x as number);

        await changeTracker.nextTick();

        assert.equal(left.value, right.value);

        left.value = 3;

        await changeTracker.nextTick();

        assert.equal(left.value, right.value);

        right.value = 4;

        await changeTracker.nextTick();

        assert.equal(left.value, right.value);

        left.value = 3;
        right.value = 5;

        await changeTracker.nextTick();

        assert.equal(right.value, 5);
        assert.equal(left.value, right.value);

        right.value = 6;
        left.value = 2;

        await changeTracker.nextTick();

        assert.equal(right.value, 6);
        assert.equal(left.value, right.value);

        changeTracker.stop();
        changeTracker.clear(); // Coverage
    }

    @test @shouldPass
    public async unsubscribe(): Promise<void>
    {
        const changeTracker = new ChangeTracker();

        changeTracker.start();

        const target = { value: 1 };

        let valueReceiver1 = 0;
        let valueReceiver2 = 0;

        const subscription1 = changeTracker.observe(target, ["value"]).subscribe(x => valueReceiver1 = x as typeof valueReceiver1);
        const subscription2 = changeTracker.observe(target, ["value"]).subscribe(x => valueReceiver2 = x as typeof valueReceiver2);

        await changeTracker.nextTick();

        assert.equal(target.value, valueReceiver1);
        assert.equal(target.value, valueReceiver2);

        subscription1.unsubscribe();
        subscription2.unsubscribe();

        const tracks = Reflect.get(changeTracker, "tracks") as Map<string, unknown>;

        assert.equal(tracks.size, 0);

        target.value = 2;

        await changeTracker.nextTick();

        assert.notEqual(target.value, valueReceiver1);
        assert.notEqual(target.value, valueReceiver2);

        changeTracker.stop();
    }

    @test @shouldFail
    public async error(): Promise<void>
    {
        const changeTracker = new ChangeTracker();

        changeTracker.start();

        // eslint-disable-next-line max-statements-per-line
        changeTracker.observe({ value: 1 }, ["value"]).subscribe(() => { throw new Error(); });

        const promise = changeTracker.nextTick();

        await assert.isRejected(promise);

        changeTracker.stop();
    }
}