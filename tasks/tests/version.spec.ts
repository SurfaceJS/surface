import { assert }                              from "chai";
import { shouldFail, shouldPass, suite, test } from "../../source/@surface/test-suite/index.js";
import Version                                 from "../internal/version.js";

@suite
export default class VersionSpec
{
    @test @shouldPass
    public parse(): void
    {
        const actual   = Version.parse("1.0.0");
        const expected = new Version(1, 0, 0);

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public compare(): void
    {
        const left  = new Version(3, 3, 3);
        const right = new Version(3, 3, 3);

        assert.equal(Version.compare(left, right), 0, "3.3.3 == 3.3.3");

        left.major = 2;

        assert.equal(Version.compare(left, right), -1, "2.3.3 < 3.3.3");
        assert.equal(Version.compare(right, left), 1,  "3.3.3 > 2.3.3");

        right.major = 2;

        assert.equal(Version.compare(left, right), 0, "2.3.3 == 2.3.3");

        left.minor = 2;

        assert.equal(Version.compare(left, right), -1, "2.2.3 < 2.3.3");
        assert.equal(Version.compare(right, left), 1,  "2.3.3 > 2.2.3");

        right.minor = 2;

        assert.equal(Version.compare(left, right), 0, "2.2.3 == 2.2.3");

        left.revision = 2;

        assert.equal(Version.compare(left, right), -1, "2.2.2 < 2.3.3");
        assert.equal(Version.compare(right, left), 1,  "2.3.3 > 2.2.2");

        right.revision = 2;

        assert.equal(Version.compare(left, right), 0, "2.2.2 == 2.2.2");

        left.prerelease = { type: "beta", version: 3 };

        assert.equal(Version.compare(left, right), -1, "2.2.2-beta.3 < 2.2.2");
        assert.equal(Version.compare(right, left), 1,  "2.2.2 > 2.2.2-beta.3");

        right.prerelease = { type: "beta", version: 3 };

        assert.equal(Version.compare(left, right), 0, "2.2.2-beta.3 == 2.2.2-beta.3");

        left.prerelease.type = "alpha";

        assert.equal(Version.compare(left, right), -1, "2.2.2-alpha.3 < 2.2.2-beta.3");
        assert.equal(Version.compare(right, left), 1,  "2.2.2-beta.3 > 2.2.2-alpha.3");

        right.prerelease.type = "alpha";

        assert.equal(Version.compare(left, right), 0, "2.2.2-alpha.3 == 2.2.2-alpha.3");

        left.prerelease.version = 2;

        assert.equal(Version.compare(left, right), -1, "2.2.2-beta.2 < 2.2.2-beta.3");
        assert.equal(Version.compare(right, left), 1,  "2.2.2-beta.3 > 2.2.2-beta.2");
    }

    @test @shouldPass
    public toString(): void
    {
        assert.equal(Version.parse("1.0.0-alpha.1").toString(), "1.0.0-alpha.1");
    }

    @test @shouldFail
    public invalid(): void
    {
        assert.throw(() => Version.parse(""));
    }
}
