import { shouldPass, suite, test }                         from "@surface/test-suite";
import * as chai                                           from "chai";
import { destruct, merge, objectFactory, structuralEqual } from "../../common/object";

@suite
export default class CommonObjectSpec
{
    @test @shouldPass
    public destructArray(): void
    {
        const source = [1, false, "some value"];

        const target = destruct("[a, b]", source);

        chai.expect(target.a).to.equal(1);
        chai.expect(target.b).to.equal(false);
        chai.expect(target.c).to.equal(undefined);
    }

    @test @shouldPass
    public destructArrayWithAlias(): void
    {
        const source = [1, false, "some value"];

        const target = destruct("[a: A, b, c: alias]", source);

        chai.expect(target.A).to.equal(1);
        chai.expect(target.b).to.equal(false);
        chai.expect(target.alias).to.equal("some value");
    }

    @test @shouldPass
    public destructArrayWithRest(): void
    {
        const source = [1, false, "some value"];

        const target = destruct("[a, ...rest]", source);

        chai.expect(target.a).to.equal(1);
        chai.expect(target.rest).to.deep.equal([false, "some value"]);
    }

    @test @shouldPass
    public destructObject(): void
    {
        const source = { a: 1, b: false, c: "some value" };

        const target = destruct("{ a, b }", source);

        chai.expect(target.a).to.equal(1);
        chai.expect(target.b).to.equal(false);
        chai.expect(target.c).to.equal(undefined);
    }

    @test @shouldPass
    public destructObjectWithAlias(): void
    {
        const source = { a: 1, b: false, c: "some value" };

        const target = destruct("{ a: A, b, c: alias }", source);

        chai.expect(target.A).to.equal(1);
        chai.expect(target.b).to.equal(false);
        chai.expect(target.alias).to.equal("some value");
    }

    @test @shouldPass
    public destructObjectWithRest(): void
    {
        const source = { a: 1, b: false, c: "some value" };

        const target = destruct("{ a, ...rest }", source);

        chai.expect(target.a).to.equal(1);
        chai.expect(target.rest).to.deep.equal({ b: false, c: "some value" });
    }

    @test @shouldPass
    public mergeObjects(): void
    {
        const target = { a: 1, b: "2", c: { a: 1, c: { a: 1, b: 2 } }, e: { }, h: { }};
        const source = { c: { b: true, c: { a: 2, c: 3 }}, e: 1, f: [1], g: { }, i: undefined, h: undefined };

        const actual = merge(target, source);

        const expect = { a: 1, b: "2", c: { a: 1, b: true, c: { a: 2, b: 2, c: 3}}, e: 1, f: [1], g: { }, h: { }};

        chai.expect(actual).to.deep.equal(expect);
    }

    @test @shouldPass
    public mergeCombineArrays(): void
    {
        const target = { values: [1, 2, 3] };
        const source = { values: [4, 5, 6] };

        const actual = merge(target, source, true);

        const expect = { values: [1, 2, 3, 4, 5, 6] };

        chai.expect(actual).to.deep.equal(expect);
    }

    @test @shouldPass
    public mergeCombineMutiplesObjects(): void
    {
        const target = { a: 1, b: "2", c: { d: 3 }};
        const source = [{ c: { e: true }}, { f: [1], g: { }}];

        const actual = merge(target, source);

        const expect = { a: 1, b: "2", c: { d: 3, e: true }, f: [1], g: { }};

        chai.expect(actual).to.deep.equal(expect);
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