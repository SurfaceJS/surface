import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Comparer                    from "../internal/comparer.js";

@suite
export default class ComparerSpec
{
    @test @shouldPass
    public compareLesser(): void
    {
        chai.assert.equal(new Comparer().compare(1, 2), -1);
    }

    @test @shouldPass
    public compareGreater(): void
    {
        chai.assert.equal(new Comparer().compare(2, 1), 1);
    }

    @test @shouldPass
    public compareEquals(): void
    {
        chai.assert.equal(new Comparer().compare(1, 1), 0);
    }

    @test @shouldPass
    public equals(): void
    {
        chai.assert.equal(new Comparer().equals(1, 2), false);
    }
}