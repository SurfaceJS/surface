import { shouldPass, suite, test } from "@surface/test-suite";
import * as chai                   from "chai";
import Hashcode                    from "../internal/hashcode";

@suite
export default class HashcodeSpec
{
    @test @shouldPass
    public getHashFromUndefined(): void
    {
        chai.expect(Hashcode.encode(undefined)).to.equal(956602377);
    }

    @test @shouldPass
    public getHashFromNull(): void
    {
        chai.expect(Hashcode.encode(null)).to.equal(1024074667);
    }

    @test @shouldPass
    public getHashFromBoolean(): void
    {
        chai.expect(Hashcode.encode(true)).to.equal(424951169);
    }

    @test @shouldPass
    public getHashFromNumber(): void
    {
        chai.expect(Hashcode.encode(0)).to.equal(187269643);
    }

    @test @shouldPass
    public getHashFromString(): void
    {
        chai.expect(Hashcode.encode("string")).to.equal(1455515299);
    }

    @test @shouldPass
    public getHashFromFunction(): void
    {
        chai.expect(Hashcode.encode(() => null)).to.equal(1945135874);
    }

    @test @shouldPass
    public getHashFromSymbol(): void
    {
        chai.expect(Hashcode.encode(Symbol())).to.equal(1494357202);
    }

    @test @shouldPass
    public getHashFromArray(): void
    {
        chai.expect(Hashcode.encode([1, 2, 3])).to.equal(456575588);
    }

    @test @shouldPass
    public getHashFromObject(): void
    {
        chai.expect(Hashcode.encode({ foo: 1, bar: 2 })).to.equal(1800467206);
    }

    @test @shouldPass
    public getHashFromWithNestedObject(): void
    {
        chai.expect(Hashcode.encode({ foo: 1, bar: { baz: 2 } })).to.equal(522101385);
    }

    @test @shouldPass
    public getHashFromObjectWithRedundance(): void
    {
        const foo = { a: 1 };
        const bar = { foo1: foo, foo2: foo };

        chai.expect(Hashcode.encode(bar)).to.equal(219473478);
    }

    @test @shouldPass
    public getHashFromObjectWithCircularReference(): void
    {
        const foo = { a: 1, bar: { }, baz: { }};
        const bar = { b: 2, baz: { }, foo, };
        const baz = { c: 3, bar, foo };

        foo.bar = bar;
        foo.baz = baz;
        bar.baz = baz;

        chai.expect(Hashcode.encode(foo)).to.equal(487198689);
    }

    @test @shouldPass
    public getHashFromDerivedObject(): void
    {
        chai.expect(Hashcode.encode(new Date())).to.equal(1050263709);
    }
}