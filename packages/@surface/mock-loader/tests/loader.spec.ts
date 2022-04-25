import util                           from "util";
import Mock                           from "@surface/mock";
import { shouldPass, suite, test }    from "@surface/test-suite";
import chai                           from "chai";
import fsProxy                        from "fs?mock";
import fsTarget                       from "fs?mock=target";
import fixture                        from "./fixture.js?mock";
import { getFixture, getFs, getUtil } from "./get-fixture.js";

@suite
export default class LoaderSpec
{
    @test @shouldPass
    public mockOf(): void
    {
        chai.assert.instanceOf(Mock.of(fixture), Mock);
        chai.assert.instanceOf(Mock.of(fsProxy), Mock);
        chai.assert.instanceOf(Mock.of(util), Mock);
        chai.assert.equal(fixture, getFixture().default);
        chai.assert.equal(fsProxy, getFs());
        chai.assert.equal(util,    getUtil());
        chai.assert.throws(() => fsTarget && !Mock.of(fsTarget));
    }
}