/* eslint-disable sort-keys */
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Hashcode                    from "../internal/hashcode.js";

@suite
export default class HashcodeSpec
{
    @test @shouldPass
    public getHashFromUndefined(): void
    {
        chai.expect(Hashcode.encode(undefined)).to.equal(1109352783);
    }

    @test @shouldPass
    public getHashFromNull(): void
    {
        chai.expect(Hashcode.encode(null)).to.equal(2144090744);
    }

    @test @shouldPass
    public getHashFromBoolean(): void
    {
        chai.expect(Hashcode.encode(true)).to.equal(2143914609);
    }

    @test @shouldPass
    public getHashFromNumber(): void
    {
        chai.expect(Hashcode.encode(0)).to.equal(2147483599);
    }

    @test @shouldPass
    public getHashFromString(): void
    {
        chai.expect(Hashcode.encode("string")).to.equal(608266288);
    }

    @test @shouldPass
    public getHashFromFunction(): void
    {
        chai.expect(Hashcode.encode(() => null)).to.equal(1055845656);
    }

    @test @shouldPass
    public getHashFromSymbol(): void
    {
        chai.expect(Hashcode.encode(Symbol("dummy"))).to.equal(1927057904);
    }

    @test @shouldPass
    public getHashFromArray(): void
    {
        chai.expect(Hashcode.encode([1, 2, 3])).to.equal(1544030469);
    }

    @test @shouldPass
    public getHashFromObject(): void
    {
        chai.expect(Hashcode.encode({ bar: 2, foo: 1 })).to.equal(2069065848);
    }

    @test @shouldPass
    public getHashFromWithNestedObject(): void
    {
        chai.expect(Hashcode.encode({ bar: { baz: 2 }, foo: 1 })).to.equal(1596877544);
    }

    @test @shouldPass
    public getHashFromObjectWithRedundance(): void
    {
        const foo = { a: 1 };
        const bar = { foo1: foo, foo2: foo };

        chai.expect(Hashcode.encode(bar)).to.equal(454832418);
    }

    @test @shouldPass
    public getHashFromObjectWithCircularReference(): void
    {
        const foo = { id: 1, foo: { }, bar: { }, baz: { } };
        const bar = { id: 2, foo: { }, bar: { }, baz: { } };
        const baz = { id: 3, foo: { }, bar: { }, baz: { } };

        foo.foo = foo;
        foo.bar = bar;
        foo.baz = baz;

        bar.foo = foo;
        bar.bar = bar;
        bar.baz = baz;

        baz.foo = foo;
        baz.bar = bar;
        baz.baz = baz;

        chai.expect(Hashcode.encode(foo)).to.equal(1338613384);
    }

    @test @shouldPass
    public getHashFromArrayWithCircularReference(): void
    {
        const foo: unknown[] = [];
        const bar: unknown[] = [];
        const baz: unknown[] = [];

        foo[0] = foo;
        foo[1] = bar;
        foo[2] = baz;

        bar[0] = foo;
        bar[1] = bar;
        bar[2] = baz;

        baz[0] = foo;
        baz[1] = bar;
        baz[2] = baz;

        chai.expect(Hashcode.encode(foo)).to.equal(1934370474);
    }

    @test @shouldPass
    public getHashFromDerivedObject(): void
    {
        chai.expect(Hashcode.encode(new Date())).to.equal(327259064);
    }
}