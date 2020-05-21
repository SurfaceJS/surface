import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import { Indexer }                             from "../..";
import
{
    deepMerge,
    deepMergeCombine,
    merge,
    objectFactory,
    pathfy,
    proxyFrom,
    structuralEqual
} from "../../internal/common/object";

@suite
export default class CommonObjectSpec
{
    @test @shouldPass
    public merge(): void
    {
        const source1 = { a: 1, b: 2, e: true as boolean|undefined  };
        const source2 = { c: null, d: undefined, e: undefined };

        const expected = { a: 1, b: 2, c: null, d: undefined, e: undefined };

        const actual = merge(source1, source2);

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mergeAndCompareDescriptors(): void
    {
        const source1: Indexer = { };
        const source2: Indexer = { };

        Object.defineProperties
        (
            source1,
            {
                a: { value: 1, writable: false, enumerable: false },
                b: { get: () => 1 }
            }
        );

        Object.defineProperties
        (
            source2,
            {
                c: { value: {  }, writable: true, enumerable: true },
                d:
                {
                    get value()
                    {
                        return source2._value as string;
                    },
                    set value(value: string)
                    {
                        source2._value = value;
                    }
                }
            }
        );

        const actual = Object.getOwnPropertyDescriptors(merge(source1, source2)) as { [x: string]: PropertyDescriptor };

        assert.deepEqual(actual.a, Object.getOwnPropertyDescriptors(source1).a);
        assert.deepEqual(actual.b, Object.getOwnPropertyDescriptors(source1).b);
        assert.deepEqual(actual.c, Object.getOwnPropertyDescriptors(source2).c);
        assert.deepEqual(actual.d, Object.getOwnPropertyDescriptors(source2).d);
    }

    @test @shouldPass
    public deepMergeObjects(): void
    {
        const target = { a: 1, b: "2", c: { a: 1, c: { a: 1, b: 2 } }, e: { }, h: { } as object|undefined};
        const source = { c: { b: true, c: { a: 2, c: 3 }}, e: 1, f: [1], g: { }, i: undefined, h: undefined };

        const expect = { a: 1, b: "2", c: { a: 1, b: true, c: { a: 2, b: 2, c: 3 }}, e: 1, f: [1], g: { }, i: undefined, h: undefined };

        const actual = deepMerge(target, source);

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeCombine(): void
    {
        const first  = { values: [1, 2, 3] };
        const second = { values: [4, 5, 6] };

        const actual = deepMergeCombine(first, second);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public deepMergeCombineMutiplesObjects(): void
    {
        const first  = { a: 1, b: "2", c: { d: 3 }};
        const second = { c: { e: true } };
        const third  = { f: [1], g: { } };

        const actual = deepMergeCombine(first, second, third);

        const expect = { a: 1, b: "2", c: { d: 3, e: true }, f: [1], g: { }};

        assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public objectFactory(): void
    {
        const actual   = objectFactory([["foo", 0], ["bar", undefined], ["baz.one", undefined], ["baz.two", undefined], ["baz.two.alpha", undefined], ["baz.two.beta", 1]]);
        const expected =
        {
            foo: 0,
            bar: undefined,
            baz:
            {
                one: undefined,
                two:
                {
                    alpha: undefined,
                    beta:  1
                },
            }
        };

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public pathfy(): void
    {
        const source = { a: 1, b: { c: 3 }, e: { f: { g: 4 } } };

        const expected = ["a: 1", "b.c: 3", "e.f.g: 4"];

        const actual = pathfy(source);

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public pathfyWithOptions(): void
    {
        const source = { a: 1, b: { c: 3 }, e: { f: { g: 4 } } };

        const expected = ["a = 1", "b-c = 3", "e-f-g = 4"];

        const actual = pathfy(source, { keySeparator: "-", valueSeparator: " = " });

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public proxyFrom(): void
    {
        const instanceA = { a: 1, b: "two", c: false };
        const instanceB = { c: true, d: null, e: [0], f: { value: 1 } };
        const instanceC = { f: { value: 2 }, g: "G" };

        const proxy = proxyFrom(instanceA, instanceB, instanceC);

        assert.equal(proxy.a, 1,     "proxy.a");
        assert.equal(proxy.b, "two", "proxy.b");
        assert.equal(proxy.c, false, "proxy.c");
        assert.equal(proxy.d, null,  "proxy.d");
        assert.deepEqual(proxy.e,                 [0],          "proxy.e");
        assert.deepEqual(proxy.f,                 { value: 1 }, "proxy.f");
        assert.deepEqual(proxy.g,                 "G",          "proxy.g");
        assert.deepEqual((proxy as Indexer)["h"], undefined,    "proxy.h");

        proxy.a = 2;
        proxy.b = "three";
        proxy.c = true;
        proxy.d = null;
        proxy.e = [1, 2];
        proxy.f = { value: 3 };
        proxy.g = "g";
        (proxy as Indexer)["h"] = 10;

        const merge = { foo: 1, bar: 2, ...proxy };

        assert.equal(merge.a, 2,       "merge.a");
        assert.equal(merge.b, "three", "merge.b");
        assert.equal(merge.c, true,    "merge.c");
        assert.equal(merge.d, null,    "merge.d");
        assert.deepEqual(merge.e,   [1, 2],           "merge.e");
        assert.deepEqual(merge.f,   { value: 3 },     "merge.f");
        assert.deepEqual(merge.g,   "g",              "merge.g");
        assert.deepEqual(merge.foo, 1,                "merge.foo");
        assert.deepEqual(merge.bar, 2,                "merge.bar");
        assert.deepEqual((merge as Indexer)["h"], 10, "merge.h");

        const descriptors = Object.getOwnPropertyDescriptors(proxy);

        assert.notEqual(descriptors.a, undefined);
        assert.notEqual(descriptors.b, undefined);
        assert.notEqual(descriptors.c, undefined);
        assert.notEqual(descriptors.d, undefined);
        assert.notEqual(descriptors.e, undefined);
        assert.notEqual(descriptors.f, undefined);
        assert.notEqual(descriptors.g, undefined);
    }

    @test @shouldPass
    public structuralEqual(): void
    {
        assert.equal(structuralEqual(1, 1),                                                 true,  "scenario 1");
        assert.equal(structuralEqual([1, 2, 3], [1, 2, 3]),                                 true,  "scenario 2");
        assert.equal(structuralEqual({ a: 1 }, { a: 1 }),                                   true,  "scenario 3");
        assert.equal(structuralEqual({ b: 1 }, { a: 1 }),                                   false, "scenario 4");
        assert.equal(structuralEqual({ a: 1, b: 2 }, { b: 2, a: 1 }),                       true,  "scenario 5");
        assert.equal(structuralEqual({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] }),             true,  "scenario 6");
        assert.equal(structuralEqual({ a: 1, b: { c: false } }, { a: 1, b: { c: false } }), true,  "scenario 7");
        assert.equal(structuralEqual({ a: 1, b: { c: false } }, { a: 1, b: { c: true } }),  false, "scenario 8");
    }
}