import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Comparer                    from "../internal/comparer";
import HashSet                     from "../internal/hash-set";

@suite
export default class HashSetSpec
{
    @test @shouldPass
    public createFromIterable(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        expect(set.contains(2)).to.equal(true);
    }

    @test @shouldPass
    public add(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        set.add(1);
        set.add(1);
        set.add(2);

        expect(set.contains(1)).to.equal(true);
    }

    @test @shouldPass
    public remove(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        set.remove(1);

        expect(set.contains(1)).to.equal(false);
    }

    @test @shouldPass
    public removeAll(): void
    {
        const elements = [1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        const set = HashSet.from(elements, new Comparer());

        elements.forEach(set.remove.bind(set));

        expect(Array.from(set).length == 0).to.equal(true);
    }

    @test @shouldPass
    public removeInvalideItem(): void
    {
        const set = HashSet.from([1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10], new Comparer());

        set.remove(1);

        expect(set.remove(11)).to.equal(false);
    }

    @test @shouldPass
    public reuseFreeList(): void
    {
        const set = new HashSet<number>(new Comparer());

        set.add(1);
        set.remove(1);
        set.add(1);

        expect(set.contains(1)).to.equal(true);
    }

    @test @shouldPass
    public iterate(): void
    {
        const data = [1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7, 8, 8, 9, 10];

        expect(Array.from(HashSet.from(data, new Comparer()))).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }

    @test @shouldPass
    public iterateEmpty(): void
    {
        const data = [] as number[];

        expect(Array.from(HashSet.from(data, new Comparer()))).to.deep.equal([]);
    }
}