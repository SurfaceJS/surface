import { shouldPass, suite, test }            from "@surface/test-suite";
import * as chai                              from "chai";
import { merge, objectFactory, proxyFactory } from "../../common/object";

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

    @test @shouldPass
    public proxyFactory(): void
    {
        const signature = { foo: 1, bar: "", baz: { foobar: false } };

        const proxy = proxyFactory(signature);

        const data      = { foo: 1, bar: "bar", baz: { foobar: false } };
        const proxyData = new proxy(data);

        const descriptors = Object.getOwnPropertyDescriptors(proxy.prototype);

        chai.expect(descriptors, "proxyData").to.include.keys("foo", "bar", "baz");
        chai.expect(proxyData.foo, "proxyData.foo").to.equal(1);
        chai.expect(proxyData.bar, "proxyData.bar").to.equal("bar");

        const bazDescriptors = Object.getOwnPropertyDescriptors(proxyData.baz.constructor.prototype);

        chai.expect(bazDescriptors, "proxyData.baz").to.include.keys("foobar");

        chai.expect(proxyData.foo).to.equal(data.foo);
        chai.expect(proxyData.bar).to.equal(data.bar);
        chai.expect(proxyData.baz.foobar).to.equal(data.baz.foobar);

        const foo    = data.foo;
        const bar    = data.bar;
        const foobar = data.baz.foobar;

        proxyData.foo = 666;
        proxyData.bar = "rab";
        proxyData.baz.foobar = true;

        chai.expect(foo,    "foo dont change").to.equal(data.foo);
        chai.expect(bar,    "bar dont change").to.equal(data.bar);
        chai.expect(foobar, "foobar dont change").to.equal(data.baz.foobar);

        proxyData.undo();

        chai.expect(proxyData.foo,        "proxyData.foo undone").to.equal(foo);
        chai.expect(proxyData.bar,        "proxyData.bar undone").to.equal(bar);
        chai.expect(proxyData.baz.foobar, "proxyData.baz.foobar undone").to.equal(foobar);

        proxyData.foo = 666;
        proxyData.bar = "rab";
        proxyData.baz.foobar = true;

        proxyData.save();

        chai.expect(proxyData.foo,        "proxyData.foo save").to.equal(666);
        chai.expect(proxyData.bar,        "proxyData.bar save").to.equal("rab");
        chai.expect(proxyData.baz.foobar, "proxyData.baz.foobar save").to.equal(true);

        const proxyData1 = new proxy(merge({ }, data));

        proxyData1.baz.foobar = false;
        proxyData1.save();
        proxyData.undo();
        chai.expect(proxyData.baz.foobar, "proxyData.baz.foobar save").to.equal(true);
    }
}