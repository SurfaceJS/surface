import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import HashEncode                  from "../internal/hash-encode";

@suite
export default class HashEncodeSpec
{
    @test @shouldPass
    public getHashFromUndefined(): void
    {
        expect(HashEncode.getHashCode(undefined)).to.equal(956602377);
    }

    @test @shouldPass
    public getHashFromNull(): void
    {
        expect(HashEncode.getHashCode(null)).to.equal(1024074667);
    }

    @test @shouldPass
    public getHashFromBoolean(): void
    {
        expect(HashEncode.getHashCode(true)).to.equal(424951169);
    }

    @test @shouldPass
    public getHashFromNumber(): void
    {
        expect(HashEncode.getHashCode(0)).to.equal(187269643);
    }

    @test @shouldPass
    public getHashFromString(): void
    {
        expect(HashEncode.getHashCode("string")).to.equal(1455515299);
    }

    @test @shouldPass
    public getHashFromFunction(): void
    {
        expect(HashEncode.getHashCode(() => null)).to.equal(1945135874);
    }

    @test @shouldPass
    public getHashFromSymbol(): void
    {
        expect(HashEncode.getHashCode(Symbol())).to.equal(1494357202);
    }

    @test @shouldPass
    public getHashFromObject(): void
    {
        expect(HashEncode.getHashCode({ foo: 1, bar: 2 })).to.equal(1800467206);
    }

    @test @shouldPass
    public getHashFromWithNestedObject(): void
    {
        expect(HashEncode.getHashCode({ foo: 1, bar: { baz: 2 } })).to.equal(522101385);
    }

    @test @shouldPass
    public getHashFromDerivedObject(): void
    {
        expect(HashEncode.getHashCode(new Date())).to.equal(1050263709);
    }
}