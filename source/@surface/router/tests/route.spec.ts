import { batchTest, shouldFail, shouldPass, suite } from "@surface/test-suite";
import { assert }                                   from "chai";
import Route                                        from "../internal/route";
import
{
    routeInvalidExpectations,
    routeValidExpectations,
    RouteInvalidExpectation,
    RouteValidExpectation
} from "./route-expectations";

@suite
export default class RouteSpec
{
    @shouldPass
    @batchTest(routeValidExpectations, x => `Pattern: "${x.pattern}" should result: "${JSON.stringify(x.expected)}"`)
    public validMatch(expectation: RouteValidExpectation): void
    {
        const actual = new Route(expectation.pattern, new Map([["transformer", x => x.split(".")]])).match(expectation.url);

        assert.deepEqual(actual, expectation.expected);
    }

    @shouldFail
    @batchTest(routeInvalidExpectations, x => `Pattern: "${x.pattern}" should throws: "${x.error.message}"`)
    public invalidMatch(expectation: RouteInvalidExpectation): void
    {
        const action = () => new Route(expectation.pattern, new Map()).match(expectation.url);

        assert.throws(action, Error, expectation.error.message);
    }
}