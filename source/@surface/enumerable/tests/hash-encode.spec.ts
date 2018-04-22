import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import HashEncode                  from "../internal/hash-encode";

@suite
export default class HashEncodeSpec
{
    @test @shouldPass
    public getHashFromUndefined(): void
    {
        expect(HashEncode.getHashCode(undefined)).to.equal(1888486230);
    }

    @test @shouldPass
    public getHashFromNull(): void
    {
        expect(HashEncode.getHashCode(null)).to.equal(1214179014);
    }

    @test @shouldPass
    public getHashFromBoolean(): void
    {
        expect(HashEncode.getHashCode(true)).to.equal(298838900);
    }

    @test @shouldPass
    public getHashFromNumber(): void
    {
        expect(HashEncode.getHashCode(0)).to.equal(1472339776);
    }

    @test @shouldPass
    public getHashFromString(): void
    {
        expect(HashEncode.getHashCode("string")).to.equal(1567235361);
    }

    @test @shouldPass
    public getHashFromFunction(): void
    {
        expect(HashEncode.getHashCode(() => null)).to.equal(1520974635);
    }

    @test @shouldPass
    public getHashFromSymbol(): void
    {
        expect(HashEncode.getHashCode(Symbol())).to.equal(1249970917);
    }

    @test @shouldPass
    public getHashFromObject(): void
    {
        expect(HashEncode.getHashCode({ foo: 1, bar: 2 })).to.equal(1808461511);
    }

    @test @shouldPass
    public getHashFromDerivedObject(): void
    {
        expect(HashEncode.getHashCode(new Date())).to.equal(569750639);
    }
}