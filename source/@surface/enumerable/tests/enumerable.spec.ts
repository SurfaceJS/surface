/* eslint-disable max-lines */
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import Comparer                                from "../internal/comparer.js";
import Enumerable                              from "../internal/enumerable.js";
import Lookup                                  from "../internal/lookup.js";

@suite
export default class EnumerableSpec
{
    @test @shouldPass
    public from(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]))).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public empty(): void
    {
        expect(Array.from(Enumerable.empty())).to.deep.equal([]);
    }

    @test @shouldPass
    public range(): void
    {
        expect(Array.from(Enumerable.range(1, 3))).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public repeat(): void
    {
        expect(Array.from(Enumerable.repeat(1, 3))).to.deep.equal([1, 1, 1]);
    }

    @test @shouldPass
    public aggregate(): void
    {
        expect(Enumerable.from([1, 2, 3]).aggregate((previous, current) => previous + current)).to.equal(6);
    }

    @test @shouldPass
    public aggregateWithSeed(): void
    {
        expect(Enumerable.from([1, 2, 3]).aggregate((previous, current) => previous + current, 10)).to.equal(16);
    }

    @test @shouldPass
    public all(): void
    {
        expect(Enumerable.from([1, 2, 3]).all(x => x > 0)).to.equal(true);
    }

    @test @shouldPass
    public notAll(): void
    {
        expect(Enumerable.from([1, 2, 3]).all(x => x < 0)).to.equal(false);
    }

    @test @shouldPass
    public any(): void
    {
        expect(Enumerable.from([1, 2, 3]).any()).to.equal(true);
    }

    @test @shouldPass
    public anyWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).any(x => x == 2)).to.equal(true);
    }

    @test @shouldPass
    public notAnyWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).any(x => x == 4)).to.equal(false);
    }

    @test @shouldPass
    public average(): void
    {
        expect(Enumerable.from([1, 2, 3]).average()).to.equal(2);
    }

    @test @shouldPass
    public averageEmpty(): void
    {
        expect(Enumerable.from([]).average()).to.equal(0);
    }

    @test @shouldPass
    public averageWithSelector(): void
    {
        expect(Enumerable.from([1, 2, 3]).average(x => x)).to.equal(2);
    }

    @test @shouldPass
    public cast(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3] as Object[]).cast<number>())).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public concat(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).concat([4, 5, 6]))).to.deep.equal([1, 2, 3, 4, 5, 6]);
    }

    @test @shouldPass
    public contains(): void
    {
        expect(Enumerable.from([1, 2, 3]).contains(1)).to.equal(true);
    }

    @test @shouldPass
    public notContains(): void
    {
        expect(Enumerable.from([1, 2, 3]).contains(4)).to.equal(false);
    }

    @test @shouldPass
    public count(): void
    {
        expect(Enumerable.from([1, 2, 3]).count()).to.equal(3);
    }

    @test @shouldPass
    public countWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).count(x => x > 2)).to.equal(1);
    }

    @test @shouldPass
    public defaultIfEmpty(): void
    {
        expect(Array.from(Enumerable.from([1, 2] as number[]).defaultIfEmpty(1))).to.deep.equal([1, 2]);
    }

    @test @shouldPass
    public defaultIfEmptyReturnDefault(): void
    {
        expect(Array.from(Enumerable.from([] as number[]).defaultIfEmpty(1))).to.deep.equal([1]);
    }

    @test @shouldPass
    public distinct(): void
    {
        expect(Array.from(Enumerable.from([1, 1, 2, 2, 3]).distinct())).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public elementAt(): void
    {
        expect(Enumerable.from([1, 2, 3]).elementAt(2)).to.equal(3);
    }

    @test @shouldPass
    public elementAtOrDefault(): void
    {
        expect(Enumerable.from([1, 2, 3]).elementAtOrDefault(2)).to.equal(3);
    }

    @test @shouldPass
    public invalidElementAtOrDefault(): void
    {
        expect(Enumerable.from([1, 2, 3]).elementAtOrDefault(5)).to.equal(null);
    }

    @test @shouldPass
    public except(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).except([2]))).to.deep.equal([1, 3]);
    }

    @test @shouldPass
    public first(): void
    {
        expect(Enumerable.from([1, 2, 3]).first()).to.equal(1);
    }

    @test @shouldPass
    public firstWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).first(x => x > 1)).to.equal(2);
    }

    @test @shouldPass
    public firstOrDefault(): void
    {
        expect(Enumerable.from([1, 2, 3]).firstOrDefault()).to.equal(1);
    }

    @test @shouldPass
    public firstOrDefaultWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).firstOrDefault(x => x > 1)).to.equal(2);
    }

    @test @shouldPass
    public firstOrDefaultReturnDefault(): void
    {
        expect(Enumerable.from([1, 2, 3]).firstOrDefault(x => x < 0)).to.equal(null);
    }

    @test @shouldPass
    public forEach(): void
    {
        let i = 0;

        Enumerable.from([1, 2, 3]).forEach(() => i++);

        expect(i).to.equal(3);
    }

    @test @shouldPass
    public fullJoin(): void
    {
        const outter =
        [
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 3 },
            { id: 4, value: 4 },
            { id: 5, value: 5 },
        ];

        const inner =
        [
            { fk: 2, id: 1, value: 1 },
            { fk: 2, id: 2, value: 2 },
            { fk: 3, id: 3, value: 3 },
            { fk: 4, id: 4, value: 4 },
            { fk: 6, id: 5, value: 5 },
        ];

        const actual = Enumerable.from(outter)
            .fullJoin(inner, x => x.id, x => x.fk, (inner, outter) => ({ inner, outter }));

        const expected =
        [
            {
                inner:  { id: 1, value: 1 },
                outter: null,
            },
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 1, value: 1 },
            },
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 2, value: 2 },
            },
            {
                inner:  { id: 3, value: 3 },
                outter: { fk: 3, id: 3, value: 3 },
            },
            {
                inner:  { id: 4, value: 4 },
                outter: { fk: 4, id: 4, value: 4 },
            },
            {
                inner:  { id: 5, value: 5 },
                outter: null,
            },
            {
                inner:  null,
                outter: { fk: 6, id: 5, value: 5 },
            },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldPass
    public groupBy(): void
    {
        const data =
        [
            { id: 1, key: "a", value: 1 },
            { id: 2, key: "a", value: 2 },
            { id: 3, key: "b", value: 3 },
            { id: 4, key: "b", value: 4 },
            { id: 5, key: "c", value: 5 },
        ];

        const expected =
        [
            { elements: [{ id: 1, key: "a", value: 1 }, { id: 2, key: "a", value: 2 }], key: "a" },
            { elements: [{ id: 3, key: "b", value: 3 }, { id: 4, key: "b", value: 4 }], key: "b" },
            { elements: [{ id: 5, key: "c", value: 5 }], key: "c" },
        ];

        expect(Array.from(Enumerable.from(data).groupBy(x => x.key))).to.deep.equal(expected);
    }

    @test @shouldPass
    public groupByWithSelector(): void
    {
        const data =
        [
            { id: 1, key: "a", value: 1 },
            { id: 2, key: "a", value: 2 },
            { id: 3, key: "b", value: 3 },
            { id: 4, key: "b", value: 4 },
            { id: 5, key: "c", value: 5 },
        ];

        const expected =
        [
            { elements: [1, 2], key: "a" },
            { elements: [3, 4], key: "b" },
            { elements: [5],    key: "c" },
        ];

        expect(Array.from(Enumerable.from(data).groupBy(x => x.key, x => x.value))).to.deep.equal(expected);
    }

    @test @shouldPass
    public groupByJoin(): void
    {
        const outter =
        [
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 3 },
            { id: 4, value: 4 },
            { id: 5, value: 5 },
        ];

        const inner =
        [
            { fk: 2, id: 1, value: 1 },
            { fk: 2, id: 2, value: 2 },
            { fk: 3, id: 3, value: 3 },
            { fk: 4, id: 4, value: 4 },
            { fk: 6, id: 5, value: 5 },
        ];

        const actual = Enumerable.from(outter).groupJoin(inner, x => x.id, x => x.fk, (inner, outter) => ({ inner, outter }));

        const expected =
        [
            {
                inner:  { id: 1, value: 1 },
                outter: [],
            },
            {
                inner:  { id: 2, value: 2 },
                outter: [{ fk: 2, id: 1, value: 1 }, { fk: 2, id: 2, value: 2 }],
            },
            {
                inner:  { id: 3, value: 3 },
                outter: [{ fk: 3, id: 3, value: 3 }],
            },
            {
                inner:  { id: 4, value: 4 },
                outter: [{ fk: 4, id: 4, value: 4 }],
            },
            {
                inner:  { id: 5, value: 5 },
                outter: [],
            },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldPass
    public intersect(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).intersect([1, 4]))).to.deep.equal([1]);
    }

    @test @shouldPass
    public join(): void
    {
        const outter =
        [
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 3 },
            { id: 4, value: 4 },
            { id: 5, value: 5 },
        ];

        const inner =
        [
            { fk: 2, id: 1, value: 1 },
            { fk: 2, id: 2, value: 2 },
            { fk: 3, id: 3, value: 3 },
            { fk: 4, id: 4, value: 4 },
            { fk: 6, id: 5, value: 5 },
        ];

        const actual = Enumerable.from(outter).join(inner, x => x.id, x => x.fk, (inner, outter) => ({ inner, outter }));

        const expected =
        [
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 1, value: 1 },
            },
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 2, value: 2 },
            },
            {
                inner:  { id: 3, value: 3 },
                outter: { fk: 3, id: 3, value: 3 },
            },
            {
                inner:  { id: 4, value: 4 },
                outter: { fk: 4, id: 4, value: 4 },
            },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldPass
    public last(): void
    {
        expect(Enumerable.from([1, 2, 3]).last()).to.equal(3);
    }

    @test @shouldPass
    public lastWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).last(x => x < 3)).to.equal(2);
    }

    @test @shouldPass
    public lastOrDefault(): void
    {
        expect(Enumerable.from([1, 2, 3]).lastOrDefault()).to.equal(3);
    }

    @test @shouldPass
    public lastOrDefaultWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).lastOrDefault(x => x < 3)).to.equal(2);
    }

    @test @shouldPass
    public lastOrDefaultReturnDefault(): void
    {
        expect(Enumerable.from([1, 2, 3]).lastOrDefault(x => x > 3)).to.equal(null);
    }

    @test @shouldPass
    public leftJoin(): void
    {
        const outter =
        [
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 3 },
            { id: 4, value: 4 },
            { id: 5, value: 5 },
        ];

        const inner =
        [
            { fk: 2, id: 1, value: 1 },
            { fk: 2, id: 2, value: 2 },
            { fk: 3, id: 3, value: 3 },
            { fk: 4, id: 4, value: 4 },
            { fk: 6, id: 5, value: 5 },
        ];

        const actual = Enumerable.from(outter)
            .leftJoin(inner, x => x.id, x => x.fk, (inner, outter) => ({ inner, outter }));

        const expected =
        [
            {
                inner:  { id: 1, value: 1 },
                outter: null,
            },
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 1, value: 1 },
            },
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 2, value: 2 },
            },
            {
                inner:  { id: 3, value: 3 },
                outter: { fk: 3, id: 3, value: 3 },
            },
            {
                inner:  { id: 4, value: 4 },
                outter: { fk: 4, id: 4, value: 4 },
            },
            {
                inner:  { id: 5, value: 5 },
                outter: null,
            },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldPass
    public max(): void
    {
        expect(Enumerable.from([1, 2, 3]).max()).to.equal(3);
    }

    @test @shouldPass
    public maxFromEmpty(): void
    {
        expect(Enumerable.from([]).max()).to.equal(0);
    }

    @test @shouldPass
    public maxUnordered(): void
    {
        expect(Enumerable.from([3, 6, 1]).max()).to.equal(6);
    }

    @test @shouldPass
    public maxWithSelector(): void
    {
        expect(Enumerable.from([1, 2, 3]).max(x => x)).to.equal(3);
    }

    @test @shouldPass
    public min(): void
    {
        expect(Enumerable.from([1, 2, 3]).min()).to.equal(1);
    }

    @test @shouldPass
    public minFromEmpty(): void
    {
        expect(Enumerable.from([]).min()).to.equal(0);
    }

    @test @shouldPass
    public minUnordered(): void
    {
        expect(Enumerable.from([3, 6, 1]).min()).to.equal(1);
    }

    @test @shouldPass
    public minWithSelector(): void
    {
        expect(Enumerable.from([1, 2, 3]).min(x => x)).to.equal(1);
    }

    @test @shouldPass
    public orderBy(): void
    {
        expect(Array.from(Enumerable.from([3, 2, 1]).orderBy(x => x))).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public orderByDescending(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).orderByDescending(x => x))).to.deep.equal([3, 2, 1]);
    }

    @test @shouldPass
    public prepend(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).prepend(0))).to.deep.equal([0, 1, 2, 3]);
    }

    @test @shouldPass
    public reverse(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).reverse())).to.deep.equal([3, 2, 1]);
    }

    @test @shouldPass
    public rightJoin(): void
    {
        const outter =
        [
            { id: 1, value: 1 },
            { id: 2, value: 2 },
            { id: 3, value: 3 },
            { id: 4, value: 4 },
            { id: 5, value: 5 },
        ];

        const inner =
        [
            { fk: 2, id: 1, value: 1 },
            { fk: 2, id: 2, value: 2 },
            { fk: 3, id: 3, value: 3 },
            { fk: 4, id: 4, value: 4 },
            { fk: 6, id: 5, value: 5 },
        ];

        const actual = Enumerable.from(outter)
            .rightJoin(inner, x => x.id, x => x.fk, (inner, outter) => ({ inner, outter }));

        const expected =
        [
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 1, value: 1 },
            },
            {
                inner:  { id: 2, value: 2 },
                outter: { fk: 2, id: 2, value: 2 },
            },
            {
                inner:  { id: 3, value: 3 },
                outter: { fk: 3, id: 3, value: 3 },
            },
            {
                inner:  { id: 4, value: 4 },
                outter: { fk: 4, id: 4, value: 4 },
            },
            {
                inner:  null,
                outter: { fk: 6, id: 5, value: 5 },
            },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldPass
    public select(): void
    {
        const data =
        [
            { id: 1, value: 11 },
            { id: 2, value: 22 },
            { id: 3, value: 33 },
        ];

        expect(Array.from(Enumerable.from(data).select(x => x.value))).to.deep.equal([11, 22, 33]);
    }

    @test @shouldPass
    public selectMany(): void
    {
        const data =
        [
            { id: 1, values: [1, 2, 3] },
            { id: 2, values: [4, 5, 6] },
            { id: 3, values: [7, 8, 9] },
        ];

        expect(Array.from(Enumerable.from(data).selectMany(x => x.values))).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }

    @test @shouldPass
    public selectManyWithSelector(): void
    {
        const data =
        [
            { id: 1, values: [1, 2, 3] },
            { id: 2, values: [4, 5, 6] },
            { id: 3, values: [7, 8, 9] },
        ];

        const actual = Enumerable.from(data).selectMany(x => x.values, (items, item) => ({ item, items }));

        const expected =
        [
            { item: 1, items: { id: 1, values: [1, 2, 3] } },
            { item: 2, items: { id: 1, values: [1, 2, 3] } },
            { item: 3, items: { id: 1, values: [1, 2, 3] } },
            { item: 4, items: { id: 2, values: [4, 5, 6] } },
            { item: 5, items: { id: 2, values: [4, 5, 6] } },
            { item: 6, items: { id: 2, values: [4, 5, 6] } },
            { item: 7, items: { id: 3, values: [7, 8, 9] } },
            { item: 8, items: { id: 3, values: [7, 8, 9] } },
            { item: 9, items: { id: 3, values: [7, 8, 9] } },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldPass
    public sequenceEqual(): void
    {
        expect(Enumerable.from([1, 2, 3]).sequenceEqual(Enumerable.from([1, 2, 3]))).to.equal(true);
    }

    @test @shouldPass
    public notSequenceEqual(): void
    {
        expect(Enumerable.from([1, 2, 3]).sequenceEqual(Enumerable.from([1, 3]))).to.equal(false);
    }

    @test @shouldPass
    public single(): void
    {
        expect(Enumerable.from([1]).single()).to.equal(1);
    }

    @test @shouldPass
    public singleWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).single(x => x == 2)).to.equal(2);
    }

    @test @shouldPass
    public singleOrDefault(): void
    {
        expect(Enumerable.from([1]).singleOrDefault()).to.equal(1);
    }

    @test @shouldPass
    public singleOrDefaultWithPredicate(): void
    {
        expect(Enumerable.from([1, 2, 3]).singleOrDefault(x => x == 2)).to.equal(2);
    }

    @test @shouldPass
    public singleOrDefaultWithPredicateReturnDefault(): void
    {
        expect(Enumerable.from([1, 2, 2, 3]).singleOrDefault(x => x == 2)).to.equal(null);
    }

    @test @shouldPass
    public skip(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).skip(1))).to.deep.equal([2, 3]);
    }

    @test @shouldPass
    public skipWhile(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3, 4, 5]).skipWhile(x => x < 3))).to.deep.equal([3, 4, 5]);
    }

    @test @shouldPass
    public take(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).take(2))).to.deep.equal([1, 2]);
    }

    @test @shouldPass
    public takeWhile(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3, 4, 5]).takeWhile(x => x < 4))).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public toArray(): void
    {
        expect(Enumerable.from([1, 2, 3]).toArray()).to.deep.equal([1, 2, 3]);
    }

    @test @shouldPass
    public toLookup(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());

        expect(Enumerable.from([1, 2, 3]).toLookup(x => x)).to.deep.equal(lookup);
    }

    @test @shouldPass
    public toLookupWithSelector(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer());

        expect(Enumerable.from([1, 2, 3]).toLookup(x => x, x => x)).to.deep.equal(lookup);
    }

    @test @shouldPass
    public thenBy(): void
    {
        const actual =
        [
            { id: 1, key: "a", value: 1 },
            { id: 1, key: "a", value: 3 },
            { id: 1, key: "b", value: 1 },
            { id: 2, key: "a", value: 3 },
            { id: 1, key: "b", value: 3 },
            { id: 3, key: "b", value: 3 },
            { id: 2, key: "a", value: 1 },
            { id: 2, key: "a", value: 2 },
            { id: 1, key: "a", value: 2 },
            { id: 1, key: "b", value: 2 },
            { id: 3, key: "b", value: 2 },
            { id: 2, key: "b", value: 2 },
            { id: 2, key: "b", value: 1 },
            { id: 3, key: "a", value: 2 },
            { id: 3, key: "a", value: 1 },
            { id: 2, key: "b", value: 3 },
            { id: 3, key: "a", value: 3 },
            { id: 3, key: "b", value: 1 },
        ];

        const expected =
        [
            { id: 1, key: "a", value: 1 },
            { id: 1, key: "a", value: 2 },
            { id: 1, key: "a", value: 3 },
            { id: 1, key: "b", value: 1 },
            { id: 1, key: "b", value: 2 },
            { id: 1, key: "b", value: 3 },
            { id: 2, key: "a", value: 1 },
            { id: 2, key: "a", value: 2 },
            { id: 2, key: "a", value: 3 },
            { id: 2, key: "b", value: 1 },
            { id: 2, key: "b", value: 2 },
            { id: 2, key: "b", value: 3 },
            { id: 3, key: "a", value: 1 },
            { id: 3, key: "a", value: 2 },
            { id: 3, key: "a", value: 3 },
            { id: 3, key: "b", value: 1 },
            { id: 3, key: "b", value: 2 },
            { id: 3, key: "b", value: 3 },
        ];

        const sorted = Array.from(Enumerable.from(actual)
            .orderBy(x => x.id)
            .thenBy(x => x.key)
            .thenBy(x => x.value));

        expect(sorted).to.deep.equal(expected);
    }

    @test @shouldPass
    public thenByDescending(): void
    {
        const actual =
        [
            { id: 1, key: "a", value: 1 },
            { id: 1, key: "a", value: 3 },
            { id: 1, key: "b", value: 1 },
            { id: 2, key: "a", value: 3 },
            { id: 1, key: "b", value: 3 },
            { id: 3, key: "b", value: 3 },
            { id: 2, key: "a", value: 1 },
            { id: 2, key: "a", value: 2 },
            { id: 1, key: "a", value: 2 },
            { id: 1, key: "b", value: 2 },
            { id: 3, key: "b", value: 2 },
            { id: 2, key: "b", value: 2 },
            { id: 2, key: "b", value: 1 },
            { id: 3, key: "a", value: 2 },
            { id: 3, key: "a", value: 1 },
            { id: 2, key: "b", value: 3 },
            { id: 3, key: "a", value: 3 },
            { id: 3, key: "b", value: 1 },
        ];

        const expected =
        [
            { id: 3, key: "b", value: 3 },
            { id: 3, key: "b", value: 2 },
            { id: 3, key: "b", value: 1 },
            { id: 3, key: "a", value: 3 },
            { id: 3, key: "a", value: 2 },
            { id: 3, key: "a", value: 1 },
            { id: 2, key: "b", value: 3 },
            { id: 2, key: "b", value: 2 },
            { id: 2, key: "b", value: 1 },
            { id: 2, key: "a", value: 3 },
            { id: 2, key: "a", value: 2 },
            { id: 2, key: "a", value: 1 },
            { id: 1, key: "b", value: 3 },
            { id: 1, key: "b", value: 2 },
            { id: 1, key: "b", value: 1 },
            { id: 1, key: "a", value: 3 },
            { id: 1, key: "a", value: 2 },
            { id: 1, key: "a", value: 1 },
        ];

        const sorted = Array.from(Enumerable.from(actual)
            .orderByDescending(x => x.id)
            .thenByDescending(x => x.key)
            .thenByDescending(x => x.value));

        expect(sorted).to.deep.equal(expected);
    }

    @test @shouldPass
    public union(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).union([3, 4, 5]))).to.deep.equal([1, 2, 3, 4, 5]);
    }

    @test @shouldPass
    public where(): void
    {
        expect(Array.from(Enumerable.from([1, 2, 3]).where(x => x > 1))).to.deep.equal([2, 3]);
    }

    @test @shouldPass
    public zip(): void
    {
        const actual   = Enumerable.from([1, 2, 3]).zip(["one", "two", "three"], (left, right) => ({ left, right }));
        const expected =
        [
            { left: 1, right: "one" },
            { left: 2, right: "two" },
            { left: 3, right: "three" },
        ];

        expect(Array.from(actual)).to.deep.equal(expected);
    }

    @test @shouldFail
    public averageError(): void
    {
        expect(() => Enumerable.from(["1", "2", "3"]).average()).to.throw(Error, "element is not a number");
    }

    @test @shouldFail
    public elementAtError(): void
    {
        expect(() => Enumerable.from([1, 2, 3]).elementAt(4)).to.throw(Error, "index is less than 0 or greater than the number of elements in source");
    }

    @test @shouldFail
    public firstError(): void
    {
        expect(() => Enumerable.from([]).first()).to.throw(Error, "the source sequence is empty");
    }

    @test @shouldFail
    public firstWithPredicateError(): void
    {
        expect(() => Enumerable.from([1, 2, 3]).first(x => x > 3)).to.throw(Error, "no element satisfies the condition in predicate");
    }

    @test @shouldFail
    public lastError(): void
    {
        expect(() => Enumerable.from([]).last()).to.throw(Error, "the source sequence is empty");
    }

    @test @shouldFail
    public lastWithPredicateError(): void
    {
        expect(() => Enumerable.from([1, 2, 3]).last(x => x > 3)).to.throw(Error, "no element satisfies the condition in predicate");
    }

    @test @shouldFail
    public maxError(): void
    {
        expect(() => Enumerable.from(["1", "2", "3"]).max()).to.throw(Error, "element is not a number");
    }

    @test @shouldFail
    public minError(): void
    {
        expect(() => Enumerable.from(["1", "2", "3"]).min()).to.throw(Error, "element is not a number");
    }

    @test @shouldFail
    public singleError(): void
    {
        expect(() => Enumerable.from([]).single()).to.throw(Error, "the source sequence is empty");
    }

    @test @shouldFail
    public singleWithPredicateError(): void
    {
        expect(() => Enumerable.from([1, 2, 3]).single(x => x > 3)).to.throw(Error, "no element satisfies the condition in predicate");
    }
}