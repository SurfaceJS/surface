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
        chai.assert.equal(Hashcode.encode(undefined), 1109352783);
    }

    @test @shouldPass
    public getHashFromNull(): void
    {
        chai.assert.equal(Hashcode.encode(null), 2144090744);
    }

    @test @shouldPass
    public getHashFromBoolean(): void
    {
        chai.assert.equal(Hashcode.encode(true), 2143914609);
    }

    @test @shouldPass
    public getHashFromNumber(): void
    {
        chai.assert.equal(Hashcode.encode(0), 2147483599);
    }

    @test @shouldPass
    public getHashFromString(): void
    {
        chai.assert.equal(Hashcode.encode("string"), 608266288);
    }

    @test @shouldPass
    public getHashFromFunction(): void
    {
        chai.assert.equal(Hashcode.encode(() => null), 1055845656);
    }

    @test @shouldPass
    public getHashFromSymbol(): void
    {
        chai.assert.equal(Hashcode.encode(Symbol("dummy")), 1927057904);
    }

    @test @shouldPass
    public getHashFromArray(): void
    {
        chai.assert.equal(Hashcode.encode([1, 2, 3]), 1544030469);
    }

    @test @shouldPass
    public getHashFromObject(): void
    {
        chai.assert.equal(Hashcode.encode({ bar: 2, foo: 1 }), 2069065848);
        chai.assert.equal(Hashcode.encode({ bar: 2, foo: 1, [Symbol("hidden")]: "ignore-me" }), 2069065848);
    }

    @test @shouldPass
    public getHashFromWithNestedObject(): void
    {
        chai.assert.equal(Hashcode.encode({ bar: { baz: 2 }, foo: 1 }), 1596877544);
    }

    @test @shouldPass
    public getHashFromObjectWithRedundance(): void
    {
        const foo = { a: 1 };
        const bar = { foo1: foo, foo2: foo };

        chai.assert.equal(Hashcode.encode(bar), 454832418);
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

        chai.assert.equal(Hashcode.encode(foo), 1338613384);
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

        chai.assert.equal(Hashcode.encode(foo), 1934370474);
    }

    @test @shouldPass
    public getHashFromDerivedObject(): void
    {
        chai.assert.equal(Hashcode.encode(new Date()), 2026361858);
    }
}