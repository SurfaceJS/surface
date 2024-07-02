import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import Comparer                    from "../internal/comparer.js";
import EnumerableSorter            from "../internal/enumerable-sorter.js";

@suite
export default class EnumerableSorterSpec
{
    @test @shouldPass
    public sort(): void
    {
        const sorter = new EnumerableSorter<number, number>(x => x, false, new Comparer());
        assert.deepEqual(sorter.sort([3, 2, 1]), [2, 1, 0]);
    }

    @test @shouldPass
    public sortDescending(): void
    {
        const sorter = new EnumerableSorter<number, number>(x => x, true, new Comparer());
        assert.deepEqual(sorter.sort([1, 2, 3]), [2, 1, 0]);
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

        assert.deepEqual(sorter.sort(list), [2, 0, 1, 3]);
    }
}
