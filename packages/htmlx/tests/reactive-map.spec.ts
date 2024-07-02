import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import ReactiveMap                             from "../internal/reactive-map.js";

@suite
export default class ReactiveMapSpec
{
    @test @shouldPass
    public create(): void
    {
        assert.instanceOf(new ReactiveMap(), Map);
    }

    @test @shouldPass
    public subscribeAndUnsubscribe(): void
    {
        const map = new ReactiveMap<string, number>();

        let values: [string, number][] = [];

        const listener = (x: Map<string, number>): void => void (values = Array.from(x));

        map.subscribe(listener);

        map.set("one", 1);

        assert.equal(values.length, 1);
        assert.deepEqual(values[0], ["one", 1]);

        map.set("two", 2);

        assert.equal(values.length, 2);
        assert.deepEqual(values[0], ["one", 1]);
        assert.deepEqual(values[1], ["two", 2]);

        map.delete("one");

        assert.equal(values.length, 1);
        assert.deepEqual(values[0], ["two", 2]);

        map.clear();

        assert.equal(values.length, 0);

        map.unsubscribe(listener);

        assert.equal(values.length, 0);

        map.set("three", 3);

        assert.equal(values.length, 0);
    }

    @test @shouldFail
    public throwsListenerNotSubscribed(): void
    {
        assert.throws(() => new ReactiveMap().unsubscribe(() => void 0));
    }
}
