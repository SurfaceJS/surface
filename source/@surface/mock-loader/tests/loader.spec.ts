import Mock                        from "@surface/mock";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import fsProxy                     from "fs?mock-load=proxy";
import fsTarget                    from "fs?mock-load=target";
import fixture                     from "./fixture.js?mock-load=proxy";
import { getCommonJS, getESM }     from "./get-fixture.js";

@suite
export default class LoaderSpec
{
    @test @shouldPass
    public mockOf(): void
    {
        chai.assert.instanceOf(Mock.of(fixture), Mock);
        chai.assert.instanceOf(Mock.of(fsProxy), Mock);
        chai.assert.equal(fixture, getESM().default);
        chai.assert.equal(fsProxy, getCommonJS());
        chai.assert.isTrue(fsTarget && !Mock.of(fsTarget));
    }
}