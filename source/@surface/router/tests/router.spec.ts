import { suite, test } from "@surface/test-suite";
import { assert }      from "chai";
import IRouteData      from "../internal/interfaces/route-data";
import Router          from "../internal/router";

@suite
export default class RouterSpec
{
    @test
    public match(): void
    {
        const expected: IRouteData =
            {
                hash:   "",
                params: {  },
                path:   "/path",
                query:  { },
            };

        const actual = new Router()
            .map( "/path")
            .match("/path");

        assert.deepEqual(actual, expected);
    }

    @test
    public dontMatch(): void
    {
        const actual = new Router()
            .map( "/path")
            .match("/path1");

        assert.equal(actual, null);
    }

    @test
    public matchWithRouteData(): void
    {
        const expected: IRouteData =
            {
                hash:   "example",
                params: { value: "path" },
                path:   "/path/path",
                query:  { value: "1" },
            };

        const actual = new Router()
            .map("/path/{value}")
            .match("/path/path?value=1#example");

        assert.deepEqual(actual, expected);
    }

    @test
    public matchWithDefaultTranformers(): void
    {
        const expected: IRouteData =
            {
                hash: "",
                params:
                {
                    boolean: true,
                    date:    new Date("2020-01-01"),
                    number:  1,
                },
                path:   "/path/true/2020-01-01/1",
                query:  { },
            };

        const actual = new Router()
            .map("/path/{boolean:Boolean}/{date:Date}/{number:Number}")
            .match("/path/true/2020-01-01/1");

        assert.deepEqual(actual, expected);
    }
}