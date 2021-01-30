/* eslint-disable max-lines */
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import Comparer                                from "../internal/comparer.js";
import Enumerable                              from "../internal/enumerable.js";
import type ILookup                            from "../internal/interfaces/lookup";
import Lookup                                  from "../internal/lookup.js";

@suite
export default class EnumerableSpec
{
    @test @shouldPass
    public from(): void
    {
        const enumerable = Enumerable.from([1, 2, 3]);

        chai.assert.deepEqual(Array.from(enumerable), [1, 2, 3]);
        chai.assert.deepEqual(enumerable.toArray(), [1, 2, 3]);
    }

    @test @shouldPass
    public empty(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.empty()), []);
    }

    @test @shouldPass
    public range(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.range(1, 3)), [1, 2, 3]);
        chai.assert.deepEqual(Array.from(Enumerable.range(3, 1)), [3, 2, 1]);
    }

    @test @shouldPass
    public repeat(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.repeat(1, 3)), [1, 1, 1]);
    }

    @test @shouldPass
    public aggregate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).aggregate((previous, current) => previous + current), 6);
    }

    @test @shouldPass
    public aggregateWithSeed(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).aggregate((previous, current) => previous + current, 10), 16);
    }

    @test @shouldPass
    public all(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).all(x => x > 0), true);
    }

    @test @shouldPass
    public notAll(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).all(x => x < 0), false);
    }

    @test @shouldPass
    public any(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).any(), true);
    }

    @test @shouldPass
    public anyWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).any(x => x == 2), true);
    }

    @test @shouldPass
    public notAnyWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).any(x => x == 4), false);
    }

    @test @shouldPass
    public average(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).average(), 2);
    }

    @test @shouldPass
    public averageEmpty(): void
    {
        chai.assert.equal(Enumerable.from([]).average(), 0);
    }

    @test @shouldPass
    public averageWithSelector(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).average(x => x), 2);
    }

    @test @shouldPass
    public cast(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3] as Object[]).cast<number>()), [1, 2, 3]);
    }

    @test @shouldPass
    public concat(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).concat([4, 5, 6])), [1, 2, 3, 4, 5, 6]);
    }

    @test @shouldPass
    public contains(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).contains(1), true);
    }

    @test @shouldPass
    public notContains(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).contains(4), false);
    }

    @test @shouldPass
    public count(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).count(), 3);
        chai.assert.equal(Enumerable.from([1, 2, 3]).count(x => x > 1), 2);
        chai.assert.equal(Enumerable.from(Enumerable.from([1, 2, 3])).count(), 3);
        chai.assert.equal(Enumerable.from(Enumerable.from([1, 2, 3])).count(x => x > 1), 2);
    }

    @test @shouldPass
    public countWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).count(x => x > 2), 1);
    }

    @test @shouldPass
    public defaultIfEmpty(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2] as number[]).defaultIfEmpty(1)), [1, 2]);
    }

    @test @shouldPass
    public defaultIfEmptyReturnDefault(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([] as number[]).defaultIfEmpty(1)), [1]);
    }

    @test @shouldPass
    public distinct(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 1, 2, 2, 3]).distinct()), [1, 2, 3]);
    }

    @test @shouldPass
    public elementAt(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).elementAt(2), 3);
    }

    @test @shouldPass
    public elementAtOrDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).elementAtOrDefault(2), 3);
    }

    @test @shouldPass
    public invalidElementAtOrDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).elementAtOrDefault(5), null);
    }

    @test @shouldPass
    public except(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).except([2])), [1, 3]);
    }

    @test @shouldPass
    public first(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).first(), 1);
    }

    @test @shouldPass
    public firstWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).first(x => x > 1), 2);
    }

    @test @shouldPass
    public firstOrDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).firstOrDefault(), 1);
    }

    @test @shouldPass
    public firstOrDefaultWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).firstOrDefault(x => x > 1), 2);
    }

    @test @shouldPass
    public firstOrDefaultReturnDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).firstOrDefault(x => x < 0), null);
    }

    @test @shouldPass
    public forEach(): void
    {
        let i = 0;

        Enumerable.from([1, 2, 3]).forEach(() => i++);

        chai.assert.equal(i, 3);
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

        chai.assert.deepEqual(Array.from(actual), expected);
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

        chai.assert.deepEqual(Array.from(Enumerable.from(data).groupBy(x => x.key)), expected);
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

        chai.assert.deepEqual(Array.from(Enumerable.from(data).groupBy(x => x.key, x => x.value)), expected);
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

        chai.assert.deepEqual(Array.from(actual), expected);
    }

    @test @shouldPass
    public intersect(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).intersect([1, 4])), [1]);
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

        chai.assert.deepEqual(Array.from(actual), expected);
    }

    @test @shouldPass
    public last(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).last(), 3);
    }

    @test @shouldPass
    public lastWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).last(x => x < 3), 2);
    }

    @test @shouldPass
    public lastOrDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).lastOrDefault(), 3);
    }

    @test @shouldPass
    public lastOrDefaultWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).lastOrDefault(x => x < 3), 2);
    }

    @test @shouldPass
    public lastOrDefaultReturnDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).lastOrDefault(x => x > 3), null);
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

        chai.assert.deepEqual(Array.from(actual), expected);
    }

    @test @shouldPass
    public max(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).max(), 3);
    }

    @test @shouldPass
    public maxFromEmpty(): void
    {
        chai.assert.equal(Enumerable.from([]).max(), 0);
    }

    @test @shouldPass
    public maxUnordered(): void
    {
        chai.assert.equal(Enumerable.from([3, 6, 1]).max(), 6);
    }

    @test @shouldPass
    public maxWithSelector(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).max(x => x), 3);
    }

    @test @shouldPass
    public min(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).min(), 1);
    }

    @test @shouldPass
    public minFromEmpty(): void
    {
        chai.assert.equal(Enumerable.from([]).min(), 0);
    }

    @test @shouldPass
    public minUnordered(): void
    {
        chai.assert.equal(Enumerable.from([3, 6, 1]).min(), 1);
    }

    @test @shouldPass
    public minWithSelector(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).min(x => x), 1);
    }

    @test @shouldPass
    public orderBy(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([3, 2, 1]).orderBy(x => x)), [1, 2, 3]);
    }

    @test @shouldPass
    public orderByDescending(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).orderByDescending(x => x)), [3, 2, 1]);
    }

    @test @shouldPass
    public prepend(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).prepend(0)), [0, 1, 2, 3]);
    }

    @test @shouldPass
    public reverse(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).reverse()), [3, 2, 1]);
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

        chai.assert.deepEqual(Array.from(actual), expected);
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

        chai.assert.deepEqual(Array.from(Enumerable.from(data).select(x => x.value)), [11, 22, 33]);
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

        chai.assert.deepEqual(Array.from(Enumerable.from(data).selectMany(x => x.values)), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
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

        chai.assert.deepEqual(Array.from(actual), expected);
    }

    @test @shouldPass
    public sequenceEqual(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).sequenceEqual(Enumerable.from([1, 2, 3])), true);
    }

    @test @shouldPass
    public notSequenceEqual(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).sequenceEqual(Enumerable.from([1, 3])), false);
    }

    @test @shouldPass
    public single(): void
    {
        chai.assert.equal(Enumerable.from([1]).single(), 1);
    }

    @test @shouldPass
    public singleWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).single(x => x == 2), 2);
    }

    @test @shouldPass
    public singleOrDefault(): void
    {
        chai.assert.equal(Enumerable.from([1]).singleOrDefault(), 1);
    }

    @test @shouldPass
    public singleOrDefaultWithPredicate(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 3]).singleOrDefault(x => x == 2), 2);
    }

    @test @shouldPass
    public singleOrDefaultWithPredicateReturnDefault(): void
    {
        chai.assert.equal(Enumerable.from([1, 2, 2, 3]).singleOrDefault(x => x == 2), null);
    }

    @test @shouldPass
    public skip(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).skip(1)), [2, 3]);
    }

    @test @shouldPass
    public skipWhile(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3, 4, 5]).skipWhile(x => x < 3)), [3, 4, 5]);
    }

    @test @shouldPass
    public take(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).take(2)), [1, 2]);
    }

    @test @shouldPass
    public takeWhile(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3, 4, 5]).takeWhile(x => x < 4)), [1, 2, 3]);
    }

    @test @shouldPass
    public toArray(): void
    {
        chai.assert.deepEqual(Enumerable.from([1, 2, 3]).toArray(), [1, 2, 3]);
    }

    @test @shouldPass
    public toLookup(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer()) as ILookup<number, unknown>;

        chai.assert.deepEqual(Enumerable.from([1, 2, 3]).toLookup(x => x), lookup);
    }

    @test @shouldPass
    public toLookupWithSelector(): void
    {
        const lookup = new Lookup([1, 2, 3], x => x, x => x, new Comparer()) as ILookup<number, unknown>;

        chai.assert.deepEqual(Enumerable.from([1, 2, 3]).toLookup(x => x, x => x), lookup);
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

        chai.assert.deepEqual(sorted, expected);
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

        chai.assert.deepEqual(sorted, expected);
    }

    @test @shouldPass
    public union(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).union([3, 4, 5])), [1, 2, 3, 4, 5]);
    }

    @test @shouldPass
    public where(): void
    {
        chai.assert.deepEqual(Array.from(Enumerable.from([1, 2, 3]).where(x => x > 1)), [2, 3]);
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

        chai.assert.deepEqual(Array.from(actual), expected);
    }

    @test @shouldFail
    public averageError(): void
    {
        chai.assert.throw(() => Enumerable.from(["1", "2", "3"]).average(), Error, "element is not a number");
    }

    @test @shouldFail
    public elementAtError(): void
    {
        chai.assert.throw(() => Enumerable.from([1, 2, 3]).elementAt(4), Error, "index is less than 0 or greater than the number of elements in source");
    }

    @test @shouldFail
    public firstError(): void
    {
        chai.assert.throw(() => Enumerable.from([]).first(), Error, "the source sequence is empty");
    }

    @test @shouldFail
    public firstWithPredicateError(): void
    {
        chai.assert.throw(() => Enumerable.from([1, 2, 3]).first(x => x > 3), Error, "no element satisfies the condition in predicate");
    }

    @test @shouldFail
    public lastError(): void
    {
        chai.assert.throw(() => Enumerable.from([]).last(), Error, "the source sequence is empty");
    }

    @test @shouldFail
    public lastWithPredicateError(): void
    {
        chai.assert.throw(() => Enumerable.from([1, 2, 3]).last(x => x > 3), Error, "no element satisfies the condition in predicate");
    }

    @test @shouldFail
    public maxError(): void
    {
        chai.assert.throw(() => Enumerable.from(["1", "2", "3"]).max(), Error, "element is not a number");
    }

    @test @shouldFail
    public minError(): void
    {
        chai.assert.throw(() => Enumerable.from(["1", "2", "3"]).min(), Error, "element is not a number");
    }

    @test @shouldFail
    public singleError(): void
    {
        chai.assert.throw(() => Enumerable.from([]).single(), Error, "the source sequence is empty");
    }

    @test @shouldFail
    public singleWithPredicateError(): void
    {
        chai.assert.throw(() => Enumerable.from([1, 2, 3]).single(x => x > 3), Error, "no element satisfies the condition in predicate");
    }
}