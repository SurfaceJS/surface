/* eslint-disable array-bracket-spacing */
/* eslint-disable sort-keys */
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import
{
    deepEqual,
    deepMerge,
    merge,
    objectFactory,
    pathfy,
    proxyFrom,
} from "../../internal/common/object.js";
import type { Indexer } from "../../internal/types";

@suite
export default class CommonObjectSpec
{
    @test @shouldPass
    public deepEqual(): void
    {
        chai.assert.isTrue(deepEqual(1, 1), "deepEqual(1, 1) isTrue");
        chai.assert.isFalse(deepEqual(null, undefined), "deepEqual(null, undefined) isFalse");

        const objectLeft  = { value: 1 };
        const objectRight = { value: 1 };

        chai.assert.isTrue(deepEqual(objectLeft, objectLeft), "deepEqual(objectLeft, objectLeft) isTrue");
        chai.assert.isTrue(deepEqual(objectLeft, objectRight), "deepEqual(objectLeft, objectRight) isTrue");

        class Mock { public value: number = 1; }

        const mockLeft  = new Mock();
        const mockRight = new Mock();

        chai.assert.isFalse(deepEqual(mockLeft, { value: 1 }), "deepEqual(mockLeft, mockRight) isFalse");
        chai.assert.isTrue(deepEqual(mockLeft, mockRight), "deepEqual(mockLeft, mockRight) isTrue");

        const nestedObjectLeft  = { value: { value: 1 } };
        const nestedObjectRight = { value: { value: 1 } };

        chai.assert.isTrue(deepEqual(nestedObjectLeft, nestedObjectRight), "deepEqual(nestedObjectLeft, nestedObjectRight) isTrue");

        const arrayLeft  = [1];
        const arrayRight = [1];

        chai.assert.isTrue(deepEqual(arrayLeft, arrayRight), "deepEqual(arrayLeft, arrayRight) isTrue");

        const nestedArrayLeft  = [[1]];
        const nestedArrayRight = [[1]];

        chai.assert.isTrue(deepEqual(nestedArrayLeft, nestedArrayRight), "deepEqual(nestedArrayLeft, nestedArrayRight) isTrue");

        const objectWithArrayLeft  = { value: [1] };
        const objectWithArrayRight = { value: [1] };

        chai.assert.isTrue(deepEqual(objectWithArrayLeft, objectWithArrayRight), "deepEqual(objectWithArrayLeft, objectWithArrayRight) isTrue");

        const arrayWithObjectLeft  = [{ value: [1] }];
        const arrayWithObjectRight = [{ value: [1] }];

        chai.assert.isTrue(deepEqual(arrayWithObjectLeft, arrayWithObjectRight), "deepEqual(arrayWithObjectLeft, arrayWithObjectRight) isTrue");

        const complexLeft  = [1, true, "string", undefined, null, { a: "a", b: { value: [{ value: "1" }] } }];
        const complexRight = [1, true, "string", undefined, null, { a: "a", b: { value: [{ value: "1" }] } }];

        chai.assert.isTrue(deepEqual(complexLeft, complexRight), "deepEqual(complexLeft, complexRight) isTrue");
    }

    @test @shouldPass
    public merge(): void
    {
        type Source = { a?: number, b?: number, c?: null, d?: string, e?: boolean };

        const left:  Source = { a: 1, b: 2, e: true };
        const right: Source = { c: null, d: undefined, e: undefined };

        const expected = { a: 1, b: 2, c: null, d: undefined, e: undefined };

        const actual = merge([left, right]);

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeWithProtectedRules(): void
    {
        type Source = { a?: number, b?: number, c?: null, d?: string, e?: boolean };

        const left:  Source = { a: 1, b: 2, e: true };
        const right: Source = { c: null, d: undefined, e: undefined };

        const expected = { a: 1, b: 2, c: null, d: undefined, e: true };

        const actual = merge([left, right], { e: "protected" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayProperty(): void
    {
        type Source = { a: (number | undefined)[], b: { a?: number, b?: number }[] };

        const left:  Source = { a: [1,  , 0,  , 5],    b: [{ a: 1 }, { b: 1 }] };
        const right: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }] };

        const expect: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }] };

        const actual = merge([left, right]);

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeArrayPropertyWithProtectedRules(): void
    {
        type Source = { a: (number | undefined)[], b: { a?: number, b?: number }[], c: { a?: number, b?: number }[] };

        const left:  Source = { a: [1,  , 0,  , 5],    b: [{ a: 1 }, { b: 1 }], c: [{ a: 1 }, { b: 1 }] };
        const right: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }], c: [{ b: 2 }, { a: 2 }] };

        const expect: Source = { a: [1, 2, 0, 4, 5, 6], b: [{ a: 1 }, { b: 1 }], c: [{ a: 1 }, { b: 1, a: 2 }] };

        const actual = merge([left, right], { a: [, , "protected"], b: "protected", c: ["protected", "merge"] });

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeArrayPropertyWithMergeRules(): void
    {
        type Source = { a: (number | undefined)[], b: { a?: number, b?: number }[], c: { a?: number, b?: number }[] };

        const left:  Source = { a: [1,  , 0,  , 5],    b: [{ a: 1 }, { b: 1 }], c: [{ a: 1 }, { b: 1 }] };
        const right: Source = { a: [ , 2, 3, 4,  , 6], b: [{ b: 2 }, { a: 2 }], c: [{ b: 2 }, { a: 2 }] };

        const expect: Source = { a: [1, 2, 3, 4, 5, 6], b: [{ a: 1, b: 2 }, { a: 2, b: 1 }], c: [{ b: 2 }, { b: 1, a: 2 }] };

        const actual = merge([left, right], { a: "merge", b: "...merge", c: [ , "merge"] });

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeArrayPropertyWithAppendRules(): void
    {
        type Source = { a: number[]  };

        const left:  Source = { a: [1] };
        const right: Source = { a: [2] };

        const expected: Source = { a: [1, 2] };

        const actual = merge([left, right], { a: "append" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayPropertyWithPrependRules(): void
    {
        type Source = { a: number[]  };

        const left:  Source = { a: [1] };
        const right: Source = { a: [2] };

        const expected: Source = { a: [2, 1] };

        const actual = merge([left, right], { a: "prepend" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayPropertyWithMatchRules(): void
    {
        type Source = { a: number[], b: { id: number, a?: number, b?: number }[], c: { id: number, a?: number, b?: number }[] };

        const left:  Source = { a: [1, 5, 3], b: [{ id: 1, a: 1 }], c: [{ id: 1, a: 1 }, { id: 2, a: 1 }, { id: 3, a: 1 }] };
        const right: Source = { a: [4, 5, 6], b: [{ id: 1, b: 2 }], c: [{ id: 1, b: 2 }, { id: 2, b: 2 }, { id: 3, b: 2 }] };

        const expected: Source = { a: [4, 5, 6], b: [{ id: 1, a: 1, b: 2 }], c: [{ id: 1, b: 2 }, { id: 2, a: 1, b: 2 }, { id: 3, b: 2 }] };

        const actual = merge([left, right], { a: [ , "match"], b: { id: "match" }, c: [, { id: "match" }, (a, b) => a.id == b.id ? b : a] });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeArrayPropertyWithUnrelatedMatchRules(): void
    {
        type Source = { a: number[], b: ({ id: number, a?: number, b?: number } | null)[], c: { id: number, a?: number, b?: number }[] };

        const left:  Source = { a: [1, 2, 3], b: [{ id: 1, a: 1 }], c: [{ id: 1, a: 1 }, { id: 2, a: 1 }, { id: 3, a: 1 }] };
        const right: Source = { a: [4, 5, 6], b: [{ id: 2, b: 2 }, null], c: [{ id: 2, a: 2 }, { id: 3, b: 2 }, { id: 4, b: 2 }] };

        const expected: Source = { a: [1, 2, 3], b: [{ id: 1, a: 1 }, null], c: [{ id: 2, a: 2 }, { id: 2, a: 1 }, { id: 3, a: 1 }] };

        const actual = merge([left, right], { a: [ , "match"], b: { id: "match" }, c: [, { id: "match" }, (a, b) => a?.id == 0 ? b : a] });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeObjectPropertyWithMatchRules(): void
    {
        type Source = { a: string, b: number };

        const left:  Source = { a: "key", b: 1 };
        const right: Source = { a: "key", b: 2 };

        const expected: Source = { a: "key", b: 2 };

        const actual = merge([left, right], { a: "match" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeObjectPropertyWithUnrelatedMatchRules(): void
    {
        type Source = { a: string, b: number };

        const left:  Source = { a: "key-1", b: 1 };
        const right: Source = { a: "key-2", b: 2 };

        const expected: Source = { a: "key-1", b: 1 };

        const actual = merge([left, right], { a: "match" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeObjectPropertyWithNestedMatchRules(): void
    {
        type Source = { a: string, b: { c: string, d: number } };

        const left:  Source = { a: "key", b: { c: "key", d: 1 } };
        const right: Source = { a: "key", b: { c: "key", d: 2 } };

        const expected: Source = { a: "key", b: { c: "key", d: 2 } };

        const actual = merge([left, right], { a: "match", b: { c: "match" } });

        chai.assert.deepEqual(actual, expected);
    }

    // @test @shouldPass
    // public mergeWithNestedReplaceRules(): void
    // {
    //     type Source = { a: { aa: { aaa?: number, aab?: number }, ab: { aba?: number, abb?: number } } };

    //     const left:  Source = { a: { aa: { aaa: 1 }, ab: { aba: 1 } } };
    //     const right: Source = { a: { aa: { aab: 2 }, ab: { abb: 2 } } };

    //     const expected: Source = { a: { aa: { aab: 2 }, ab: { aba: 1, abb: 2 } } };

    //     const actual = merge([left, right], { a: { aa: "replace" } });

    //     chai.assert.deepEqual(actual, expected);
    // }

    @test @shouldPass
    public mergeWithNestedWithUnrelatedMatchRules(): void
    {
        type Source = { a: string, b: { c: string, d: number } };

        const left:  Source = { a: "key-1", b: { c: "key-1", d: 1 } };
        const right: Source = { a: "key-2", b: { c: "key-2", d: 2 } };

        const expected: Source = { a: "key-2", b: { c: "key-1", d: 1 } };

        const actual = merge([left, right], { b: { c: "match" } });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public deepMergeObjects(): void
    {
        const left  = { a: 1, b: "2", c: { a: 1, c: { a: 1, b: 2 } }, e: { }, h: { } as object | undefined };
        const right = { c: { b: true, c: { a: 2, c: 3 } }, e: 1, f: [1], g: { }, h: undefined, i: undefined };

        const expect = { a: 1, b: "2", c: { a: 1, b: true, c: { a: 2, b: 2, c: 3 } }, e: 1, f: [1], g: { }, h: undefined, i: undefined };

        const actual = deepMerge(left, right);

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeArrays(): void
    {
        const left  = { values: [1,  , 2, 3, 5] };
        const right = { values: [ , 2, 3, 4, , 6] };

        const actual = deepMerge(left, right);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeArraysOfObjects(): void
    {
        const first  = { values: [, { one: 1 }, { four: 4 }] as const };
        const second = { values: [, { two: 2 }, { five: 5 }] as const };
        const third  = { values: [{ zero: 0 }, { three: 3 }, { six: 6 }] as const };

        const actual = deepMerge(first, second, third);

        // eslint-disable-next-line sort-keys
        const expect = { values: [{ zero: 0 }, { one: 1, two: 2, three: 3 }, { four: 4, five: 5, six: 6 }] };

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeMutiplesObjects(): void
    {
        const first  = { a: 1, b: "2", c: { d: 3 } };
        const second = { c: { e: true } };
        const third  = { f: [1], g: { } };

        const actual = deepMerge(first, second, third);

        const expect = { a: 1, b: "2", c: { d: 3, e: true }, f: [1], g: { } };

        chai.assert.deepEqual(actual, expect);
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

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public pathfy(): void
    {
        const source = { a: 1, b: { c: 3 }, e: { f: { g: 4 } } };

        const expected = ["a: 1", "b.c: 3", "e.f.g: 4"];

        const actual = pathfy(source);

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public pathfyWithOptions(): void
    {
        const source = { a: 1, b: { c: 3 }, e: { f: { g: 4 } } };

        const expected = ["a = 1", "b-c = 3", "e-f-g = 4"];

        const actual = pathfy(source, { keySeparator: "-", valueSeparator: " = " });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public proxyFrom(): void
    {
        const instanceA = { a: 1, b: "two", c: false };
        const instanceB = { c: true, d: null, e: [0], f: { value: 1 } };
        const instanceC = { f: { value: 2 }, g: "G" };

        const proxy = proxyFrom(instanceA, instanceB, instanceC);

        chai.assert.equal(proxy.a,                  1,            "proxy.a");
        chai.assert.equal(proxy.b,                  "two",        "proxy.b");
        chai.assert.equal(proxy.c,                  false,        "proxy.c");
        chai.assert.equal(proxy.d,                  null,         "proxy.d");
        chai.assert.deepEqual(proxy.e,              [0],          "proxy.e");
        chai.assert.deepEqual(proxy.f,              { value: 1 }, "proxy.f");
        chai.assert.deepEqual(proxy.g,              "G",          "proxy.g");
        chai.assert.deepEqual((proxy as Indexer).h, undefined,    "proxy.h");

        proxy.a = 2;
        proxy.b = "three";
        proxy.c = true;
        proxy.d = null;
        proxy.e = [1, 2];
        proxy.f = { value: 3 };
        proxy.g = "g";
        (proxy as Indexer).h = 10;

        const merge = { bar: 2, foo: 1, ...proxy };

        chai.assert.equal(merge.a,       2,             "merge.a");
        chai.assert.equal(merge.b,       "three",       "merge.b");
        chai.assert.equal(merge.c,       true,          "merge.c");
        chai.assert.equal(merge.d,       null,          "merge.d");
        chai.assert.deepEqual(merge.e,   [1, 2],        "merge.e");
        chai.assert.deepEqual(merge.f,   { value: 3 },  "merge.f");
        chai.assert.deepEqual(merge.g,   "g",           "merge.g");
        chai.assert.deepEqual(merge.foo, 1,             "merge.foo");
        chai.assert.deepEqual(merge.bar, 2,             "merge.bar");
        chai.assert.deepEqual((merge as Indexer).h, 10, "merge.h");

        const descriptors = Object.getOwnPropertyDescriptors(proxy);

        chai.assert.notEqual(descriptors.a, undefined);
        chai.assert.notEqual(descriptors.b, undefined);
        chai.assert.notEqual(descriptors.c, undefined);
        chai.assert.notEqual(descriptors.d, undefined);
        chai.assert.notEqual(descriptors.e, undefined);
        chai.assert.notEqual(descriptors.f, undefined);
        chai.assert.notEqual(descriptors.g, undefined);
    }
}