import { suite, test } from "@surface/test-suite";
import { assert }      from "chai";
import Router          from "../internal/router";
import RouterMatch     from "../internal/types/router-match";

@suite
export default class RouterSpec
{
    @test
    public unmatch(): void
    {
        const expected: RouterMatch =
            {
                matched: false,
                reason:  "No match found to the path: /path1"
            };

        const actual = new Router()
            .map("/path", x => x)
            .match("/path1");

        assert.deepEqual(actual, expected);
    }

    @test
    public match(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    hash:       "",
                    parameters: {  },
                    path:       "/path",
                    query:      { },
                }
            };

        const actual = new Router()
            .map("/path")
            .match("/path");

        assert.deepEqual(actual, expected);
    }

    @test
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

        assert.deepEqual(actual, expected);
    }

    @test
    public matchNamed(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    hash:       "",
                    parameters: {  },
                    path:       "/path",
                    query:      { },
                }
            };

        const actual = new Router()
            .map("default", "/path")
            .match("default", { });

        assert.deepEqual(actual, expected);
    }

    @test
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

        assert.deepEqual(actual, expected);
    }

    @test
    public matchNamedWithParams(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    hash:       "",
                    parameters: { value: "path" },
                    path:       "/path/path",
                    query:      { },
                }
            };

        const actual = new Router()
            .map("default", "/path/{value}")
            .match("default", { value: "path" });

        assert.deepEqual(actual, expected);
    }

    @test
    public matchNamedWithParamsTranformers(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    hash:   "",
                    parameters:
                    {
                        boolean: true,
                        date:    new Date("2020-01-01"),
                        number:  1
                    },
                    path:   "/path/true/2020-01-01/1",
                    query:  { },
                }
            };

        const actual = new Router()
            .map("default", "/path/{boolean:Boolean}/{date:Date}/{number:Number}")
            .match("default", { boolean: true, date: new Date("2020-01-01"), number: 1 });

        assert.deepEqual(actual, expected);
    }

    @test
    public dontMatch(): void
    {
        const actual = new Router()
            .map( "/path")
            .match("/path1");

        assert.deepEqual(actual, { matched: false, reason: "No match found to the path: /path1" });
    }

    @test
    public matchWithRouteData(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    hash:       "example",
                    parameters: { value: "path" },
                    path:       "/path/path",
                    query:      { value: "1" },
                }
            };

        const actual = new Router()
            .map("/path/{value}")
            .match("/path/path?value=1#example");

        assert.deepEqual(actual, expected);
    }

    @test
    public matchWithDefaultTranformers(): void
    {
        const expected: RouterMatch =
            {
                matched: true,
                value:
                {
                    hash: "",
                    parameters:
                    {
                        boolean: true,
                        date:    new Date("2020-01-01"),
                        number:  1,
                    },
                    path:   "/path/true/2020-01-01/1",
                    query:  { },
                }
            };

        const actual = new Router()
            .map("/path/{boolean:Boolean}/{date:Date}/{number:Number}")
            .match("/path/true/2020-01-01/1");

        assert.deepEqual(actual, expected);
    }
}