import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import chaiAsPromised                          from "chai-as-promised";
import Publisher                               from "../internal/publisher.js";

chai.use(chaiAsPromised);

@suite
export default class SuiteSpec
{
    @test @shouldPass
    public async bump(): Promise<void>
    {
        await chai.assert.isFulfilled(new Publisher().bump());
    }

    @test @shouldFail
    public failingTest(): void
    {
        chai.assert.isNotOk(false);
    }
}