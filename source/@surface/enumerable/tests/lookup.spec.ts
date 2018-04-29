import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Comparer                    from "../internal/comparer";
import Group                       from "../internal/group";
import Lookup                      from "../internal/lookup";

@suite
export default class LookupSpec
{
    @test @shouldPass
    public count(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        expect(lookup.count).to.equal(3);
    }

    @test @shouldPass
    public contains(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        expect(lookup.contains(1)).to.equal(true);
    }

    @test @shouldPass
    public get(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        expect(lookup.get(1)).to.deep.equal([1]);
    }

    @test @shouldPass
    public getSharedKey(): void
    {
        const data   =
        [
            { key: 1, value: 1 },
            { key: 2, value: 2 },
            { key: 2, value: 3 }
        ];
        const lookup = new Lookup(data, x => x.key, x => x, new Comparer());
        expect(lookup.get(2)).to.deep.equal([{ key: 2, value: 2 }, { key: 2, value: 3 } ]);
    }

    @test @shouldPass
    public getNonValidKey(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());
        expect(lookup.get(4)).to.deep.equal([]);
    }

    @test @shouldPass
    public resize(): void
    {
        const data   = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const lookup = new Lookup(data, x => x, x => x, new Comparer());

        expect(lookup.count).to.deep.equal(10);
    }

    @test @shouldPass
    public iterate(): void
    {
        const data   = [1, 2, 3];
        const lookup = new Lookup(data, x => x, x => x, new Comparer());

        const group1 = new Group<number, number>(787185639,  1);
        group1.add(1);
        group1["_hashNext"] = undefined;

        const group2 = new Group<number, number>(102031502,  2);
        group2.add(2);
        group2["_hashNext"] = undefined;

        const group3 = new Group<number, number>(1564361012, 3);
        group3.add(3);
        group3["_hashNext"] = undefined;

        group1.next = group2;
        group2.next = group3;
        group3.next = group1;

        expect(Array.from(lookup)).to.deep.equal([group1, group2, group3]);
    }
}