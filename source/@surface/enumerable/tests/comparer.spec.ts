import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Comparer                    from "../internal/comparer.js";

@suite
export default class ComparerSpec
{
    @test @shouldPass
    public compareLesser(): void
    {
        expect(new Comparer().compare(1, 2)).to.equal(-1);
    }

    @test @shouldPass
    public compareGreater(): void
    {
        expect(new Comparer().compare(2, 1)).to.equal(1);
    }

    @test @shouldPass
    public compareEquals(): void
    {
        expect(new Comparer().compare(1, 1)).to.equal(0);
    }

    @test @shouldPass
    public equals(): void
    {
        expect(new Comparer().equals(1, 2)).to.equal(false);
    }
}