import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Hashcode                    from "../hashcode";

@suite
export default class HashcodeSpec
{
    @test @shouldPass
    public getHashFromUndefined(): void
    {
        expect(Hashcode.encode(undefined)).to.equal(956602377);
    }

    @test @shouldPass
    public getHashFromNull(): void
    {
        expect(Hashcode.encode(null)).to.equal(1024074667);
    }

    @test @shouldPass
    public getHashFromBoolean(): void
    {
        expect(Hashcode.encode(true)).to.equal(424951169);
    }

    @test @shouldPass
    public getHashFromNumber(): void
    {
        expect(Hashcode.encode(0)).to.equal(187269643);
    }

    @test @shouldPass
    public getHashFromString(): void
    {
        expect(Hashcode.encode("string")).to.equal(1455515299);
    }

    @test @shouldPass
    public getHashFromFunction(): void
    {
        expect(Hashcode.encode(() => null)).to.equal(1945135874);
    }

    @test @shouldPass
    public getHashFromSymbol(): void
    {
        expect(Hashcode.encode(Symbol())).to.equal(1494357202);
    }

    @test @shouldPass
    public getHashFromObject(): void
    {
        expect(Hashcode.encode({ foo: 1, bar: 2 })).to.equal(1800467206);
    }

    @test @shouldPass
    public getHashFromWithNestedObject(): void
    {
        expect(Hashcode.encode({ foo: 1, bar: { baz: 2 } })).to.equal(522101385);
    }

    @test @shouldPass
    public getHashFromDerivedObject(): void
    {
        expect(Hashcode.encode(new Date())).to.equal(1050263709);
    }
}