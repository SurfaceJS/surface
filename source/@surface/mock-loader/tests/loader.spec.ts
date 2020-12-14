import fs                          from "fs";
import Mock                        from "@surface/mock";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import fixture                     from "./fixture.js?require=proxy";
import { getCommonJS, getESM }     from "./get-fixture.js";

@suite
export default class LoaderSpec
{
    @test @shouldPass
    public mockOf(): void
    {
        chai.assert.equal(Mock.of(fixture)!.constructor.name, Mock.name);
        chai.assert.equal(Mock.of(fs)!.constructor.name, Mock.name);
        chai.assert.equal(fixture, getESM().default);
        chai.assert.equal(fs, getCommonJS());
    }
}