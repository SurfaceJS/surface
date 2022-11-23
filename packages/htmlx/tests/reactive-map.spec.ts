import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import ReactiveMap                             from "../internal/reactive-map.js";

@suite
export default class ReactiveMapSpec
{
    @test @shouldPass
    public create(): void
    {
        chai.assert.instanceOf(new ReactiveMap(), Map);
    }

    @test @shouldPass
    public subscribeAndUnsubscribe(): void
    {
        const map = new ReactiveMap<string, number>();

        let values: [string, number][] = [];

        const listener = (x: Map<string, number>): void => void (values = Array.from(x));

        map.subscribe(listener);

        map.set("one", 1);

        chai.assert.equal(values.length, 1);
        chai.assert.deepEqual(values[0], ["one", 1]);

        map.set("two", 2);

        chai.assert.equal(values.length, 2);
        chai.assert.deepEqual(values[0], ["one", 1]);
        chai.assert.deepEqual(values[1], ["two", 2]);

        map.delete("one");

        chai.assert.equal(values.length, 1);
        chai.assert.deepEqual(values[0], ["two", 2]);

        map.clear();

        chai.assert.equal(values.length, 0);

        map.unsubscribe(listener);

        chai.assert.equal(values.length, 0);

        map.set("three", 3);

        chai.assert.equal(values.length, 0);
    }

    @test @shouldFail
    public throwsListenerNotSubscribed(): void
    {
        chai.assert.throws(() => new ReactiveMap().unsubscribe(() => void 0));
    }
}
