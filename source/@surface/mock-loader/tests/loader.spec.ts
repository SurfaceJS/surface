import Mock                        from "@surface/mock";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import fsProxy                     from "fs?mock-module=proxy";
import fsTarget                    from "fs?mock-module=target";
import fixture                     from "./fixture.js?mock-module=proxy";
import { getCommonJS, getESM }     from "./get-fixture.js";

@suite
export default class LoaderSpec
{
    @test @shouldPass
    public mockOf(): void
    {
        chai.assert.equal(Mock.of(fixture)!.constructor.name, Mock.name);
        chai.assert.equal(Mock.of(fsProxy)!.constructor.name, Mock.name);
        chai.assert.equal(fixture, getESM().default);
        chai.assert.equal(fsProxy, getCommonJS());
        chai.assert.isTrue(fsTarget && !Mock.of(fsTarget));
    }
}