import util                           from "util";
import Mock                           from "@surface/mock";
import { shouldPass, suite, test }    from "@surface/test-suite";
import { assert }                     from "chai";
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
        assert.instanceOf(Mock.of(fixture), Mock);
        assert.instanceOf(Mock.of(fsProxy), Mock);
        assert.instanceOf(Mock.of(util), Mock);
        assert.equal(fixture, getFixture().default);
        assert.equal(fsProxy, getFs());
        assert.equal(util,    getUtil());
        assert.throws(() => fsTarget && !Mock.of(fsTarget));
    }
}
