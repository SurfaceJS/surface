import { batchTest, shouldFail, shouldPass, suite }            from "@surface/test-suite";
import { assert }                                              from "chai";
import type ITransformer                                       from "../internal/interfaces/transformer";
import Route                                                   from "../internal/route.js";
import type RouteMatch                                         from "../internal/types/route-match";
import type { RouteInvalidExpectation, RouteValidExpectation } from "./route-expectations.js";
import { routeInvalidExpectations, routeValidExpectations }    from "./route-expectations.js";

const transformer: ITransformer = { parse: x => x.split("."), stringfy: (x: string[]) => x.join(".") };
const transformers = new Map([["transformer", transformer]]);

@suite
export default class RouteSpec
{
    @shouldPass
    @batchTest(routeValidExpectations, x => `Pattern: "${x.pattern}" should result: "${JSON.stringify(x.expected)}"`)
    public validMatch(expectation: RouteValidExpectation): void
    {
        const actual = new Route(expectation.pattern, transformers).match(expectation.value);

        assert.deepEqual(actual, expectation.expected);
    }

    @shouldFail
    @batchTest(routeInvalidExpectations, x => `Pattern: "${x.pattern}" should throws: "${x.error.message}"`)
    public invalidMatch(expectation: RouteInvalidExpectation): void
    {
        const action = (): RouteMatch => new Route(expectation.pattern, transformers).match(expectation.value);

        assert.throws(action, Error, expectation.error.message);
    }
}