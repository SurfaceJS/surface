import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Comparer                    from "../internal/comparer";
import EnumerableSorter            from "../internal/enumerable-sorter";

@suite
export default class EnumerableSorterSpec
{
    @test @shouldPass
    public sort(): void
    {
        const sorter = new EnumerableSorter<number, number>(x => x, false, new Comparer());
        expect(sorter.sort([3, 2, 1])).to.deep.equal([2, 1, 0]);
    }

    @test @shouldPass
    public sortDescending(): void
    {
        const sorter = new EnumerableSorter<number, number>(x => x, true, new Comparer());
        expect(sorter.sort([1, 2, 3])).to.deep.equal([2, 1, 0]);
    }

    @test @shouldPass
    public sortNext(): void
    {
        const list =
        [
            { key: "a", value: "1" },
            { key: "b", value: "2" },
            { key: "a", value: "1" },
            { key: "c", value: "5" },
        ];

        const next   = new EnumerableSorter<string, { key: string, value: string }>(x => x.value, false, new Comparer());
        const sorter = new EnumerableSorter<string, { key: string, value: string }>(x => x.key, false, new Comparer(), next);

        expect(sorter.sort(list)).to.deep.equal([2, 0, 1, 3]);
    }
}