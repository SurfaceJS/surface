import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import Router                                  from "../internal/router.js";
import type RouterMatch                        from "../internal/types/router-match.js";

@suite
export default class RouterSpec
{
    @test @shouldPass
    public noMatch(): void
    {
        const actual = new Router()
            .map({ pattern: "/path" })
            .match("/path1");

        chai.assert.deepEqual(actual, { matched: false, reason: "No match found to the path: /path1" });
    }

    @test @shouldPass
    public noMatchWithSelector(): void
    {
        const expected: RouterMatch =
        {
            matched: false,
            reason:  "No match found to the path: /path1",
        };

        const actual = new Router()
            .map({ pattern: "/path", selector: x => x })
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
            .map({ pattern: "/path" })
            .match("/path");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mismatchNamed(): void
    {
        const expected: RouterMatch =
        {
            matched: false,
            reason:  "No named route found to: default1",
        };

        const actual = new Router()
            .map({ name: "default", pattern: "/path", selector: x => x })
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
            .map({ name: "default", pattern: "/path" })
            .match("default", { });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public mismatchNamedWithParams(): void
    {
        const expected: RouterMatch =
        {
            matched: false,
            reason:  "Missing parameters: value",
        };

        const actual = new Router()
            .map({ name: "default", pattern: "/path/{value}" })
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
            .map({ name: "default", pattern: "/path/{value}" })
            .match("default", { value: "path" });

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public matchNamedWithParamsTransformers(): void
    {
        const expected1: RouterMatch =
        {
            matched: true,
            value:
            {
                parameters:
                {
                    boolean: false,
                },
                path: "/path/false",
            },
        };

        const actual1 = new Router()
            .map({ name: "default", pattern: "/path/{boolean:Boolean}" })
            .match("default", { boolean: false });

        chai.assert.deepEqual(actual1, expected1);

        const expected2: RouterMatch =
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

        const actual2 = new Router()
            .map({ name: "default", pattern: "/path/{boolean:Boolean}/{date:Date}/{number:Number}" })
            .match("default", { boolean: true, date: new Date("2020-01-01"), number: 1 });

        chai.assert.deepEqual(actual2, expected2);
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
            .map({ pattern: "/path/{value}" })
            .match("/path/path");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public matchWithDefaultConstraintsAndTransformers(): void
    {
        const expected: RouterMatch =
        {
            matched: true,
            value:
            {
                parameters:
                {
                    alpha:   "text",
                    boolean: true,
                    date:    new Date("2020-01-01"),
                    id:      "e7dcfc52e66d11ebba800242ac130004",
                    number:  1,
                },
                path: "/path/text/e7dcfc52e66d11ebba800242ac130004/true/2020-01-01/1",
            },
        };

        const actual = new Router()
            .map({ pattern: "/path/{alpha:Alpha}/{id:UIID}/{boolean:Boolean}/{date:Date}/{number:Number}" })
            .match("/path/text/e7dcfc52e66d11ebba800242ac130004/true/2020-01-01/1");

        chai.assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public invalidPath(): void
    {
        chai.assert.throws(() => new Router().match("foo?bar"), Error, "\"foo?bar\" is not a valid url pathname");
        chai.assert.throws(() => new Router().match("foo#bar"), Error, "\"foo#bar\" is not a valid url pathname");
    }
}
