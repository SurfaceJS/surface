import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Comparer                    from "../internal/comparer.js";
import Group                       from "../internal/group.js";
import Lookup                      from "../internal/lookup.js";

@suite
export default class LookupSpec
{
    @test @shouldPass
    public count(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        chai.assert.equal(lookup.count, 3);
    }

    @test @shouldPass
    public contains(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        chai.assert.equal(lookup.contains(1), true);
    }

    @test @shouldPass
    public get(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        chai.assert.deepEqual(lookup.get(1), [1]);
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
        chai.assert.deepEqual(lookup.get(2), [{ key: 2, value: 2 }, { key: 2, value: 3 }]);
    }

    @test @shouldPass
    public getNonValidKey(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        chai.assert.deepEqual(lookup.get(4), []);
    }

    @test @shouldPass
    public resize(): void
    {
        const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const lookup = new Lookup(data, x => x, x => x, new Comparer());

        chai.assert.deepEqual(lookup.count, 10);
    }

    @test @shouldPass
    public iterate(): void
    {
        const data   = [1, 2, 3];
        const lookup = new Lookup(data, x => x, x => x, new Comparer());

        const group1 = new Group<number, number>(683302763,  1);
        group1.add(1);
        // @ts-expect-error
        group1._hashNext = undefined;

        const group2 = new Group<number, number>(1179335883,  2);
        group2.add(2);
        // @ts-expect-error
        group2._hashNext = undefined;

        const group3 = new Group<number, number>(1675369003, 3);
        group3.add(3);
        // @ts-expect-error
        group3._hashNext = undefined;

        group1.next = group2;
        group2.next = group3;
        group3.next = group1;

        chai.assert.deepEqual(Array.from(lookup), [group1, group2, group3]);
    }
}
