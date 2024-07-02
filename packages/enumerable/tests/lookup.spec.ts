import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import Comparer                    from "../internal/comparer.js";
import Lookup                      from "../internal/lookup.js";

@suite
export default class LookupSpec
{
    @test @shouldPass
    public count(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        assert.equal(lookup.count, 3);
    }

    @test @shouldPass
    public contains(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        assert.equal(lookup.contains(1), true);
    }

    @test @shouldPass
    public get(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        assert.deepEqual(lookup.get(1), [1]);
    }

    @test @shouldPass
    public getSharedKey(): void
    {
        const data   =
        [
            { key: 1, value: 1 },
            { key: 2, value: 2 },
            { key: 2, value: 3 },
        ];
        const lookup = new Lookup(data, x => x.key, x => x, new Comparer());
        assert.deepEqual(lookup.get(2), [{ key: 2, value: 2 }, { key: 2, value: 3 }]);
    }

    @test @shouldPass
    public getNonValidKey(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        assert.deepEqual(lookup.get(4), []);
    }

    @test @shouldPass
    public resize(): void
    {
        const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const lookup = new Lookup(data, x => x, x => x, new Comparer());

        assert.deepEqual(lookup.count, 10);
    }

    @test @shouldPass
    public iterate(): void
    {
        const data   = [1, 2, 3];
        const lookup = new Lookup(data, x => x, x => x, new Comparer());

        assert.deepEqual(Array.from(lookup).length, 3);
    }
}
