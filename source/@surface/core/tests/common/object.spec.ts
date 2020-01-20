import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import { Indexer }                             from "../..";
import
{
    merge,
    objectFactory,
    proxyFrom,
    structuralEqual
} from "../../common/object";

@suite
export default class CommonObjectSpec
{
    @test @shouldPass
    public mergeObjects(): void
    {
        const target = { a: 1, b: "2", c: { a: 1, c: { a: 1, b: 2 } }, e: { }, h: { }};
        const source = { c: { b: true, c: { a: 2, c: 3 }}, e: 1, f: [1], g: { }, i: undefined, h: undefined };

        const actual = merge([target, source]);

        const expect = { a: 1, b: "2", c: { a: 1, b: true, c: { a: 2, b: 2, c: 3}}, e: 1, f: [1], g: { }, h: { }};

        chai.expect(actual).to.deep.equal(expect);
    }

    @test @shouldPass
    public mergeCombineArrays(): void
    {
        const first  = { values: [1, 2, 3] };
        const second = { values: [4, 5, 6] };

        const actual = merge([first, second], true);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        chai.assert.deepEqual(actual, expect);
    }

    @test @shouldPass
    public mergeCombineMutiplesObjects(): void
    {
        const first  = { a: 1, b: "2", c: { d: 3 }};
        const second = { c: { e: true } };
        const third  = { f: [1], g: { } };

        const actual = merge([first, second, third]);

        const expect = { a: 1, b: "2", c: { d: 3, e: true }, f: [1], g: { }};

        chai.assert.deepEqual(actual, expect);
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

        chai.expect(actual).to.deep.equal(expected);
    }

    @test @shouldFail
    public proxyFrom(): void
    {
        const instanceA = { a: 1, b: "two", c: false };
        const instanceB = { c: true, d: null, e: [0], f: { value: 1 } };
        const instanceC = { f: { value: 2 }, g: "G" };

        const proxy = proxyFrom(instanceA, instanceB, instanceC);

        chai.expect(proxy.a, "proxy.a").to.equal(1);
        chai.expect(proxy.b, "proxy.b").to.equal("two");
        chai.expect(proxy.c, "proxy.c").to.equal(false);
        chai.expect(proxy.d, "proxy.d").to.equal(null);
        chai.expect(proxy.e, "proxy.e").to.deep.equal([0]);
        chai.expect(proxy.f, "proxy.f").to.deep.equal({ value: 1 });
        chai.expect(proxy.g, "proxy.g").to.deep.equal("G");
        chai.expect((proxy as Indexer)["h"], "proxy.h").to.deep.equal(undefined);

        proxy.a = 2;
        proxy.b = "three";
        proxy.c = true;
        proxy.d = null;
        proxy.e = [1, 2];
        proxy.f = { value: 3 };
        proxy.g = "g";
        (proxy as Indexer)["h"] = 10;

        const merge = { foo: 1, bar: 2, ...proxy };

        chai.expect(merge.a,   "merge.a").to.equal(2);
        chai.expect(merge.b,   "merge.b").to.equal("three");
        chai.expect(merge.c,   "merge.c").to.equal(true);
        chai.expect(merge.d,   "merge.d").to.equal(null);
        chai.expect(merge.e,   "merge.e").to.deep.equal([1, 2]);
        chai.expect(merge.f,   "merge.f").to.deep.equal({ value: 3 });
        chai.expect(merge.g,   "merge.g").to.deep.equal("g");
        chai.expect(merge.foo, "merge.foo").to.deep.equal(1);
        chai.expect(merge.bar, "merge.bar").to.deep.equal(2);
        chai.expect((merge as Indexer)["h"], "merge.h").to.deep.equal(10);

        const descriptors = Object.getOwnPropertyDescriptors(proxy);

        chai.expect(descriptors.a).not.to.equal(undefined);
        chai.expect(descriptors.b).not.to.equal(undefined);
        chai.expect(descriptors.c).not.to.equal(undefined);
        chai.expect(descriptors.d).not.to.equal(undefined);
        chai.expect(descriptors.e).not.to.equal(undefined);
        chai.expect(descriptors.f).not.to.equal(undefined);
        chai.expect(descriptors.g).not.to.equal(undefined);
    }

    @test @shouldPass
    public structuralEqual(): void
    {
        chai.expect(structuralEqual(1, 1), "scenario 1").to.equal(true);
        chai.expect(structuralEqual([1, 2, 3], [1, 2, 3]), "scenario 2").to.equal(true);
        chai.expect(structuralEqual({ a: 1 }, { a: 1 }), "scenario 3").to.equal(true);
        chai.expect(structuralEqual({ b: 1 }, { a: 1 }), "scenario 4").to.equal(false);
        chai.expect(structuralEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), "scenario 5").to.equal(true);
        chai.expect(structuralEqual({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] }), "scenario 6").to.equal(true);
        chai.expect(structuralEqual({ a: 1, b: { c: false } }, { a: 1, b: { c: false } }), "scenario 7").to.equal(true);
        chai.expect(structuralEqual({ a: 1, b: { c: false } }, { a: 1, b: { c: true } }), "scenario 8").to.equal(false);
    }
}