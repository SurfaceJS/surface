/* eslint-disable max-statements */
/* eslint-disable array-bracket-spacing */
/* eslint-disable sort-keys */
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                         from "chai";
import
{
    DeepMergeFlags,
    deepEqual,
    deepMerge,
    makePath,
    merge,
    objectFactory,
    proxyFrom,
} from "../../internal/common/object.js";
import type { Indexer } from "../../internal/types/index.js";

@suite
export default class CommonObjectSpec
{
    @test @shouldPass
    public deepEqual(): void
    {
        assert.isTrue(deepEqual(1, 1), "deepEqual(1, 1) isTrue");
        assert.isFalse(deepEqual(null, undefined), "deepEqual(null, undefined) isFalse");

        const objectLeft  = { value: 1, regex: /abc/g, date: new Date(0) };
        const objectRight = { value: 1, regex: /abc/g, date: new Date(0) };

        assert.isTrue(deepEqual(objectLeft, objectLeft), "deepEqual(objectLeft, objectLeft) isTrue");
        assert.isTrue(deepEqual(objectLeft, objectRight), "deepEqual(objectLeft, objectRight) isTrue");

        class Mock { public value: number = 1; }

        const mockLeft  = new Mock();
        const mockRight = new Mock();

        assert.isFalse(deepEqual(mockLeft, { value: 1 }), "deepEqual(mockLeft, mockRight) isFalse");
        assert.isTrue(deepEqual(mockLeft, mockRight), "deepEqual(mockLeft, mockRight) isTrue");

        const nestedObjectLeft  = { value: { value: 1 } };
        const nestedObjectRight = { value: { value: 1 } };

        assert.isTrue(deepEqual(nestedObjectLeft, nestedObjectRight), "deepEqual(nestedObjectLeft, nestedObjectRight) isTrue");

        const arrayLeft  = [1, 2, 3];
        const arrayRight = [1, 2, 3];

        assert.isTrue(deepEqual(arrayLeft, arrayRight), "deepEqual(arrayLeft, arrayRight) isTrue");

        const setLeft  = new Set([1, 2, 3]);
        const setRight = new Set([1, 2, 3]);

        assert.isTrue(deepEqual(setLeft, setRight), "deepEqual(setLeft, setRight) isTrue");

        const mapLeft  = new Map([[1, 1], [2, 2], [3, 3]]);
        const mapRight = new Map([[1, 1], [2, 2], [3, 3]]);

        assert.isTrue(deepEqual(mapLeft, mapRight), "deepEqual(mapLeft, mapRight) isTrue");

        const nestedArrayLeft  = [[1]];
        const nestedArrayRight = [[1]];

        assert.isTrue(deepEqual(nestedArrayLeft, nestedArrayRight), "deepEqual(nestedArrayLeft, nestedArrayRight) isTrue");

        const objectWithArrayLeft  = { value: [1] };
        const objectWithArrayRight = { value: [1] };

        assert.isTrue(deepEqual(objectWithArrayLeft, objectWithArrayRight), "deepEqual(objectWithArrayLeft, objectWithArrayRight) isTrue");

        const arrayWithObjectLeft  = [{ value: [1] }];
        const arrayWithObjectRight = [{ value: [1] }];

        assert.isTrue(deepEqual(arrayWithObjectLeft, arrayWithObjectRight), "deepEqual(arrayWithObjectLeft, arrayWithObjectRight) isTrue");

        const complexLeft  = [1, true, "string", undefined, null, { a: "a", b: { value: [{ value: "1" }] } }];
        const complexRight = [1, true, "string", undefined, null, { a: "a", b: { value: [{ value: "1" }] } }];

        assert.isTrue(deepEqual(complexLeft, complexRight), "deepEqual(complexLeft, complexRight) isTrue");

        const notObjectLeft: object  = { value: 1 };
        const notObjectRight: object = { value1: 1 };

        assert.isFalse(deepEqual(notObjectLeft, notObjectRight), "deepEqual(notObjectLeft, notObjectRight) isFalse");

        const arrayWithDifferentValuesLeft  = [1, 2, 3];
        const arrayWithDifferentValuesRight = [1, 3, 3];

        assert.isFalse(deepEqual(arrayWithDifferentValuesLeft, arrayWithDifferentValuesRight), "deepEqual(arrayWithDifferentValuesLeft, arrayWithDifferentValuesRight) isFalse");

        const arrayWithDifferentSizeLeft  = [1, 2];
        const arrayWithDifferentSizeRight = [1, 2, 3];

        assert.isFalse(deepEqual(arrayWithDifferentSizeLeft, arrayWithDifferentSizeRight), "deepEqual(arrayWithDifferentSizeLeft, arrayWithDifferentSizeRight) isFalse");

        const setWithDifferentValuesLeft  = new Set([1, 2, 3]);
        const setWithDifferentValuesRight = new Set([1, 3, 3]);

        assert.isFalse(deepEqual(setWithDifferentValuesLeft, setWithDifferentValuesRight), "deepEqual(setWithDifferentValuesLeft, setWithDifferentValuesRight) isFalse");

        const setWithDifferentSizeLeft  = new Set([1, 2]);
        const setWithDifferentSizeRight = new Set([1, 2, 3]);

        assert.isFalse(deepEqual(setWithDifferentSizeLeft, setWithDifferentSizeRight), "deepEqual(setWithDifferentSizeLeft, setWithDifferentSizeRight) isFalse");

        const mapWithDifferentValuesLeft  = new Map([[1, 1], [2, 2], [3, 3]]);
        const mapWithDifferentValuesRight = new Map([[1, 1], [2, 2], [4, 3]]);

        assert.isFalse(deepEqual(mapWithDifferentValuesLeft, mapWithDifferentValuesRight), "deepEqual(mapWithDifferentValuesLeft, mapWithDifferentValuesRight) isFalse");

        const mapWithDifferentSizeLeft  = new Map([[1, 1], [2, 2]]);
        const mapWithDifferentSizeRight = new Map([[1, 1], [2, 2], [3, 3]]);

        assert.isFalse(deepEqual(mapWithDifferentSizeLeft, mapWithDifferentSizeRight), "deepEqual(mapWithDifferentSizeLeft, mapWithDifferentSizeRight) isFalse");
    }

    @test @shouldPass
    public merge(): void
    {
        type Source = { a?: number, b?: number, c?: null, d?: string, e?: boolean };

        const left:  Source = { a: 1, b: 2, e: true };
        const right: Source = { c: null, d: undefined, e: undefined };

        const expected = { a: 1, b: 2, c: null, d: undefined, e: undefined };

        const actual = merge([left, right]);

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeWithProtectedRules(): void
    {
        type Source = { a?: number, b?: number, c?: null, d?: string, e?: boolean };

        const left:  Source = { a: 1, b: 2, e: true };
        const right: Source = { c: null, d: undefined, e: undefined };

        const expected = { a: 1, b: 2, c: null, d: undefined, e: true };

        const actual = merge([left, right], { e: "protected" });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayProperty(): void
    {
        type Source = { a: (number | undefined)[], b: { a?: number, b?: number }[] };

        const left:  Source = { a: [1,  , 0,  , 5],    b: [{ a: 1 }, { b: 1 }] };
        const right: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }] };

        const expect: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }] };

        const actual = merge([left, right]);

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeArrayPropertyWithProtectedRules(): void
    {
        type Source = { a: (number | undefined)[], b: { a?: number, b?: number }[], c: { a?: number, b?: number }[] };

        const left:  Source = { a: [1,  , 0,  , 5],    b: [{ a: 1 }, { b: 1 }], c: [{ a: 1 }, { b: 1 }] };
        const right: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }], c: [{ b: 2 }, { a: 2 }] };

        const expect: Source = { a: [1, 2, 0, 4, 5, 6], b: [{ a: 1 }, { b: 1 }], c: [{ a: 1 }, { b: 1, a: 2 }] };

        const actual = merge([left, right], { a: [, , "protected"], b: "protected", c: ["protected", "merge"] });

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeArrayPropertyWithMergeRules(): void
    {
        type Source = { a: (number | undefined)[], b: { a?: number, b?: number }[], c: { a?: number, b?: number }[] };

        const left:  Source = { a: [1,  , 0,  , 5],    b: [{ a: 1 }, { b: 1 }], c: [{ a: 1 }, { b: 1 }] };
        const right: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }], c: [{ b: 2 }, { a: 2 }] };

        const expect: Source = { a: [1, 2, 3, 4, 5, 6], b: [{ a: 1, b: 2 }, { a: 2, b: 1 }], c: [{ b: 2 }, { b: 1, a: 2 }] };

        const actual = merge([left, right], { a: "merge", b: "...merge", c: [ , "merge"] });

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeArrayPropertyWithAppendRules(): void
    {
        type Source = { a: number[]  };

        const left:  Source = { a: [1] };
        const right: Source = { a: [2] };

        const expected: Source = { a: [1, 2] };

        const actual = merge([left, right], { a: "append" });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayPropertyWithPrependRules(): void
    {
        type Source = { a: number[]  };

        const left:  Source = { a: [1] };
        const right: Source = { a: [2] };

        const expected: Source = { a: [2, 1] };

        const actual = merge([left, right], { a: "prepend" });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayPropertyWithMatchRules(): void
    {
        type Source = { a: RegExp[], b: { id: number, a?: number, b?: number }[], c: { id: number, a?: number, b?: number }[] };

        const left:  Source = { a: [/1/, /5/, /3/], b: [{ id: 1, a: 1 }], c: [{ id: 1, a: 1 }, { id: 2, a: 1 }, { id: 3, a: 1 }] };
        const right: Source = { a: [/4/, /5/, /6/], b: [{ id: 1, b: 2 }], c: [{ id: 1, b: 2 }, { id: 2, b: 2 }, { id: 3, b: 2 }] };

        const expected: Source = { a: [/4/, /5/, /6/], b: [{ id: 1, a: 1, b: 2 }], c: [{ id: 1, b: 2 }, { id: 2, a: 1, b: 2 }, { id: 3, b: 2 }] };

        const actual = merge([left, right], { a: [ , "match"], b: { id: "match" }, c: [, { id: "match" }, (a, b) => a.id == b.id ? b : a] });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayPropertyWithUnrelatedMatchRules(): void
    {
        type Source = { a: number[], b: ({ id: number, a?: number, b?: number } | null)[], c: { id: number, a?: number, b?: number }[] };

        const left:  Source = { a: [1, 2, 3], b: [{ id: 1, a: 1 }], c: [{ id: 1, a: 1 }, { id: 2, a: 1 }, { id: 3, a: 1 }] };
        const right: Source = { a: [4, 5, 6], b: [{ id: 2, b: 2 }, null], c: [{ id: 2, a: 2 }, { id: 3, b: 2 }, { id: 4, b: 2 }] };

        const expected: Source = { a: [1, 2, 3], b: [{ id: 1, a: 1 }, null], c: [{ id: 2, a: 2 }, { id: 2, a: 1 }, { id: 3, a: 1 }] };

        const actual = merge([left, right], { a: [ , "match"], b: { id: "match" }, c: [, { id: "match" }, (a, b) => a?.id == 0 ? b : a] });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeObjectPropertyWithMatchRules(): void
    {
        type Source = { a: string, b: number };

        const left:  Source = { a: "key", b: 1 };
        const right: Source = { a: "key", b: 2 };

        const expected: Source = { a: "key", b: 2 };

        const actual = merge([left, right], { a: "match" });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeObjectPropertyWithUnrelatedMatchRules(): void
    {
        type Source = { a: string, b: number };

        const left:  Source = { a: "key-1", b: 1 };
        const right: Source = { a: "key-2", b: 2 };

        const expected: Source = { a: "key-1", b: 1 };

        const actual = merge([left, right], { a: "match" });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeObjectPropertyWithNestedMatchRules(): void
    {
        type Source = { a: string, b: { c: string, d: number } };

        const left:  Source = { a: "key", b: { c: "key", d: 1 } };
        const right: Source = { a: "key", b: { c: "key", d: 2 } };

        const expected: Source = { a: "key", b: { c: "key", d: 2 } };

        const actual = merge([left, right], { a: "match", b: { c: "match" } });

        assert.deepEqual(actual, expected);
    }

    // @test @shouldPass
    // public mergeWithNestedReplaceRules(): void
    // {
    //     type Source = { a: { aa: { aaa?: number, aab?: number }, ab: { aba?: number, abb?: number } } };

    //     const left:  Source = { a: { aa: { aaa: 1 }, ab: { aba: 1 } } };
    //     const right: Source = { a: { aa: { aab: 2 }, ab: { abb: 2 } } };

    //     const expected: Source = { a: { aa: { aab: 2 }, ab: { aba: 1, abb: 2 } } };

    //     const actual = merge([left, right], { a: { aa: "replace" } });

    //     assert.deepEqual(actual, expected);
    // }

    @test @shouldPass
    public mergeWithNestedWithUnrelatedMatchRules(): void
    {
        type Source = { a: string, b: { c: string, d: number } };

        const left:  Source = { a: "key-1", b: { c: "key-1", d: 1 } };
        const right: Source = { a: "key-2", b: { c: "key-2", d: 2 } };

        const expected: Source = { a: "key-2", b: { c: "key-1", d: 1 } };

        const actual = merge([left, right], { b: { c: "match" } });

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public deepMergeObjects(): void
    {
        const left   = { a: 1, b: { a: 1,          c: [1], d: null }, c: { }, d: [0], e: { } as object | null,  f: { } as object | undefined };
        const right  = {       b: {       b: true, c: [2]          }, c: 1,   d: [1], e: null,                  f: undefined, h: undefined };
        const expect = { a: 1, b: { a: 1, b: true, c: [2], d: null }, c: 1,   d: [1], e: null,                  f: undefined, h: undefined };

        const actual = deepMerge([left, right]);

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeObjectsIgnoreUndefined(): void
    {
        const left   = { a: 1, b: [undefined] };
        const right  = {                       e: undefined, f: { a: undefined } };
        const expect = { a: 1, b: [undefined],               f: { } };

        const actual = deepMerge([left, right], DeepMergeFlags.IgnoreUndefined);

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeConcatArrays(): void
    {
        const left  = { values: [1, 2, 3] };
        const right = { values: [4, 5, 6] };

        const actual = deepMerge([left, right], DeepMergeFlags.ConcatArrays);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeArrays(): void
    {
        const left  = { values: [1,  , 2, 3, 5] };
        const right = { values: [ , 2, 3, 4, , 6] };

        const actual = deepMerge([left, right], DeepMergeFlags.MergeArrays);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeArraysOfObjects(): void
    {
        const first  = { values: [, { one: 1 }, { four: 4 }] as const };
        const second = { values: [, { two: 2 }, { five: 5 }] as const };
        const third  = { values: [{ zero: 0 }, { three: 3 }, { six: 6 }] as const };

        const actual = deepMerge([first, second, third], DeepMergeFlags.MergeArrays);

        // eslint-disable-next-line sort-keys
        const expect = { values: [{ zero: 0 }, { one: 1, two: 2, three: 3 }, { four: 4, five: 5, six: 6 }] };

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeMultiplesObjects(): void
    {
        const first  = { a: 1, b: "2", c: { d: 3 } };
        const second = { c: { e: true } };
        const third  = { f: [1], g: { } };

        const actual = deepMerge([first, second, third]);

        const expect = { a: 1, b: "2", c: { d: 3, e: true }, f: [1], g: { } };

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public objectFactory(): void
    {
        const actual   = objectFactory([["foo", 0], ["bar", undefined], ["baz.one", undefined], ["baz.two", undefined], ["baz.two.alpha", undefined], ["baz.two.beta", 1]]);
        const expected =
        {
            bar: undefined,
            baz:
            {
                one: undefined,
                two:
                {
                    alpha: undefined,
                    beta:  1,
                },
            },
            foo: 0,
        };

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public makePath(): void
    {
        const source = { a: 1, b: { c: 3 }, e: { f: { g: 4 } } };

        const expected = ["a: 1", "b.c: 3", "e.f.g: 4"];

        const actual = makePath(source);

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public makePathWithOptions(): void
    {
        const source = { a: 1, b: { c: 3 }, e: { f: { g: 4 } } };

        const expected = ["a = 1", "b-c = 3", "e-f-g = 4"];

        const actual = makePath(source, { keySeparator: "-", valueSeparator: " = " });

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public proxyFrom(): void
    {
        const instanceA = { a: 1, b: "two", c: false };
        const instanceB = { c: true, d: null, e: [0], f: { value: 1 } };
        const instanceC = { f: { value: 2 }, g: "G" };

        const proxy = proxyFrom(instanceA, instanceB, instanceC);

        assert.equal(proxy.a,                  1,            "proxy.a");
        assert.equal(proxy.b,                  "two",        "proxy.b");
        assert.equal(proxy.c,                  false,        "proxy.c");
        assert.equal(proxy.d,                  null,         "proxy.d");
        assert.deepEqual(proxy.e,              [0],          "proxy.e");
        assert.deepEqual(proxy.f,              { value: 1 }, "proxy.f");
        assert.deepEqual(proxy.g,              "G",          "proxy.g");
        assert.deepEqual((proxy as Indexer).h, undefined,    "proxy.h");

        proxy.a = 2;
        proxy.b = "three";
        proxy.c = true;
        proxy.d = null;
        proxy.e = [1, 2];
        proxy.f = { value: 3 };
        proxy.g = "g";
        (proxy as Indexer).h = 10;

        const merge = { bar: 2, foo: 1, ...proxy };

        assert.equal(merge.a,       2,             "merge.a");
        assert.equal(merge.b,       "three",       "merge.b");
        assert.equal(merge.c,       true,          "merge.c");
        assert.equal(merge.d,       null,          "merge.d");
        assert.deepEqual(merge.e,   [1, 2],        "merge.e");
        assert.deepEqual(merge.f,   { value: 3 },  "merge.f");
        assert.deepEqual(merge.g,   "g",           "merge.g");
        assert.deepEqual(merge.foo, 1,             "merge.foo");
        assert.deepEqual(merge.bar, 2,             "merge.bar");
        assert.deepEqual((merge as Indexer).h, 10, "merge.h");

        const descriptors = Object.getOwnPropertyDescriptors(proxy);

        assert.notEqual(descriptors.a, undefined);
        assert.notEqual(descriptors.b, undefined);
        assert.notEqual(descriptors.c, undefined);
        assert.notEqual(descriptors.d, undefined);
        assert.notEqual(descriptors.e, undefined);
        assert.notEqual(descriptors.f, undefined);
        assert.notEqual(descriptors.g, undefined);
    }
}
