import { shouldPass, suite, test }     from "@surface/test-suite";
import * as chai                       from "chai";
import { objectFactory, proxyFactory } from "../../common/object";

@suite
export default class CommonObjectSpec
{
    @test @shouldPass
    public objectFactory(): void
    {
        const actual   = objectFactory(["foo", "bar", "baz.one", "baz.two", "baz.two.alpha", "baz.two.beta"]);
        const expected =
        {
            foo: undefined,
            bar: undefined,
            baz:
            {
                one: undefined,
                two:
                {
                    alpha: undefined,
                    beta:  undefined
                },
            }
        };

        chai.expect(actual).to.deep.equal(expected);
    }

    @test @shouldPass
    public proxyFactory(): void
    {
        const data      = { foo: 1, bar: "", baz: { foobar: false } };
        const proxy     = proxyFactory(data);
        const proxyData = new proxy(data);

        const descriptors = Object.getOwnPropertyDescriptors(proxy.prototype);

        chai.expect(Object.keys(descriptors), "Object.keys(descriptors)").to.deep.equal(["constructor", "foo", "bar", "baz"]);
        chai.expect(proxyData.foo, "proxyData.foo").to.equal(1);
        chai.expect(proxyData.bar, "proxyData.bar").to.equal("");

        const bazDescriptors = Object.getOwnPropertyDescriptors(proxyData.baz!.constructor.prototype);

        chai.expect(Object.keys(bazDescriptors), "Object.keys(bazDescriptors)").to.deep.equal(["constructor", "foobar"]);

        chai.expect(proxyData.foo).to.equal(data.foo);
        chai.expect(proxyData.bar).to.equal(data.bar);
        chai.expect(proxyData.baz!["foobar"]).to.equal(data.baz.foobar);
    }
}