import { shouldPass, suite, test } from "@surface/test-suite";
import * as chai                   from "chai";
import { merge, objectFactory }    from "../../common/object";

@suite
export default class CommonObjectSpec
{
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
}