import { shouldFail, shouldPass, suite, test }  from "@surface/test-suite";
import chai             from "chai";
import Router           from "../internal/router.js";
import type RouterMatch from "../internal/types/router-match";

@suite
export default class RouterSpec
{
    @test @shouldPass
    public unmatch(): void
    {
        const expected: RouterMatch =
            {
                matched: false,
                reason:  "No match found to the path: /path1",
            };

        const actual = new Router()
            .map("/path", x => x)
            .match("/path1");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public match(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    parameters: {  },
                    path:       "/path",
                },
            };

        const actual = new Router()
            .map("/path")
            .match("/path");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public unmatchNamed(): void
    {
        const expected: RouterMatch =
            {
                matched: false,
                reason:  "No named route found to: default1",
            };

        const actual = new Router()
            .map("default", "/path", x => x)
            .match("default1", { });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public matchNamed(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    parameters: {  },
                    path:       "/path",
                },
            };

        const actual = new Router()
            .map("default", "/path")
            .match("default", { });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public unmatchNamedWithParams(): void
    {
        const expected: RouterMatch =
            {
                matched: false,
                reason:  "Missing required parameters: value",
            };

        const actual = new Router()
            .map("default", "/path/{value}")
            .match("default", { });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public matchNamedWithParams(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    parameters: { value: "path" },
                    path:       "/path/path",
                },
            };

        const actual = new Router()
            .map("default", "/path/{value}")
            .match("default", { value: "path" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public matchNamedWithParamsTranformers(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    parameters:
                    {
                        boolean: true,
                        date:    new Date("2020-01-01"),
                        number:  1,
                    },
                    path: "/path/true/2020-01-01/1",
                },
            };

        const actual = new Router()
            .map("default", "/path/{boolean:Boolean}/{date:Date}/{number:Number}")
            .match("default", { boolean: true, date: new Date("2020-01-01"), number: 1 });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public dontMatch(): void
    {
        const actual = new Router()
            .map("/path")
            .match("/path1");

        chai.assert.deepEqual(actual, { matched: false, reason: "No match found to the path: /path1" });
    }

    @test @shouldPass
    public matchWithRouteData(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    parameters: { value: "path" },
                    path:       "/path/path",
                },
            };

        const actual = new Router()
            .map("/path/{value}")
            .match("/path/path");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public matchWithDefaultTranformers(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    parameters:
                    {
                        boolean: true,
                        date:    new Date("2020-01-01"),
                        number:  1,
                    },
                    path: "/path/true/2020-01-01/1",
                },
            };

        const actual = new Router()
            .map("/path/{boolean:Boolean}/{date:Date}/{number:Number}")
            .match("/path/true/2020-01-01/1");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public invalidPath(): void
    {
        chai.assert.throws(() => new Router().match("foo?bar"), Error, "\"foo?bar\" is not a valid url pathname");
        chai.assert.throws(() => new Router().match("foo#bar"), Error, "\"foo#bar\" is not a valid url pathname");
    }
}