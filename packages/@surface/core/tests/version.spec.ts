import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import Version                                 from "../internal/version.js";

@suite
export default class VersionSpec
{
    @test @shouldPass
    public parse(): void
    {
        chai.assert.deepEqual(Version.parse("1.0"), new Version(1, 0, 0));
        chai.assert.deepEqual(Version.parse("1.0.0"), new Version(1, 0, 0));
        chai.assert.deepEqual(Version.parse("1.0.0-alpha"), new Version(1, 0, 0, "alpha"));
        chai.assert.deepEqual(Version.parse("1.0.0-alpha+affeb12"), new Version(1, 0, 0, "alpha", "affeb12"));
    }

    @test @shouldPass
    public compare(): void
    {
        chai.assert.deepEqual(Version.compare(new Version(1, 0, 0), new Version(2, 0, 0)), -1);
        chai.assert.deepEqual(Version.compare(new Version(1, 0, 0, "alpha"), new Version(1, 0, 0)), -1);

        chai.assert.deepEqual(Version.compare(new Version(1, 0, 0, "alpha"), new Version(1, 0, 0, "alpha")), 0);
        chai.assert.deepEqual(Version.compare(new Version(1, 0, 0), new Version(1, 0, 0)), 0);
        chai.assert.deepEqual(Version.compare(new Version(1, 1, 0), new Version(1, 1, 0)), 0);
        chai.assert.deepEqual(Version.compare(new Version(1, 1, 1), new Version(1, 1, 1)), 0);

        chai.assert.deepEqual(Version.compare(new Version(1, 0, 0), new Version(1, 0, 0, "alpha")), 1);
        chai.assert.deepEqual(Version.compare(new Version(1, 0, 1), new Version(1, 0, 0)), 1);
        chai.assert.deepEqual(Version.compare(new Version(1, 1, 0), new Version(1, 0, 0)), 1);
        chai.assert.deepEqual(Version.compare(new Version(2, 0, 0), new Version(1, 0, 0)), 1);
    }

    @test @shouldPass
    public toString(): void
    {
        chai.assert.deepEqual(Version.parse("1.0").toString(), "1.0.0");
        chai.assert.deepEqual(Version.parse("1.0.0").toString(), "1.0.0");
        chai.assert.deepEqual(Version.parse("1.0.0-alpha").toString(), "1.0.0-alpha");
        chai.assert.deepEqual(Version.parse("1.0.0-alpha+affeb12").toString(), "1.0.0-alpha+affeb12");
    }

    @test @shouldFail
    public failingTest(): void
    {
        chai.assert.throws(() => Version.parse("*"));
        chai.assert.throws(() => Version.parse("1.*.*"));
        chai.assert.throws(() => Version.parse("1.x.x"));
    }
}