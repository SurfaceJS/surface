import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import Comparer                    from "../internal/comparer.js";
import HashSet                     from "../internal/hash-set.js";

@suite
export default class HashSetSpec
{
    @test @shouldPass
    public createFromIterable(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        assert.equal(set.contains(2), true);
    }

    @test @shouldPass
    public add(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        set.add(1);
        set.add(1);
        set.add(2);

        assert.equal(set.contains(1), true);
    }

    @test @shouldPass
    public remove(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        set.remove(1);

        assert.equal(set.contains(1), false);
    }

    @test @shouldPass
    public removeAll(): void
    {
        const elements = [1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        const set = HashSet.from(elements, new Comparer());

        elements.forEach(set.remove.bind(set));

        assert.equal(Array.from(set).length == 0, true);
    }

    @test @shouldPass
    public removeInvalidItem(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        set.remove(1);

        assert.equal(set.remove(11), false);
    }

    @test @shouldPass
    public reuseFreeList(): void
    {
        const set = new HashSet<number>(new Comparer());

        set.add(1);
        set.remove(1);
        set.add(1);

        assert.equal(set.contains(1), true);
    }

    @test @shouldPass
    public iterate(): void
    {
        const data = [1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 8, 9, 10];

        assert.deepEqual(Array.from(HashSet.from(data, new Comparer())), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    @test @shouldPass
    public iterateEmpty(): void
    {
        const data = [] as number[];

        assert.deepEqual(Array.from(HashSet.from(data, new Comparer())), []);
    }
}
