import { batchTest, shouldFail, shouldPass, suite }            from "@surface/test-suite";
import { assert }                                              from "chai";
import type IConstraint                                        from "../internal/interfaces/constraint.js";
import type ITransformer                                       from "../internal/interfaces/transformer.js";
import Route                                                   from "../internal/route.js";
import type RouteMatch                                         from "../internal/types/route-match.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { RouteInvalidExpectation, RouteValidExpectation } from "./route-expectations.js";
import { routeInvalidExpectations, routeValidExpectations }    from "./route-expectations.js";

const numberConstraint:   IConstraint  = { validate: x => !Number.isNaN(Number(x)) };
const alphaConstraint:    IConstraint  = { validate: x => /[a-z]/i.test(x) };
const booleanTransformer: ITransformer = { parse: x => x == "true", stringify: String };
const numberTransformer:  ITransformer = { parse: Number, stringify: String };

const constraints  = new Map([["Number", numberConstraint],  ["Alpha", alphaConstraint]]);
const transformers = new Map([["Number", numberTransformer], ["Boolean", booleanTransformer]]);

@suite
export default class RouteSpec
{
    @shouldPass
    @batchTest(routeValidExpectations, x => `Pattern: "${x.pattern}" should result: "${JSON.stringify(x.expected)}"`)
    public validMatch(expectation: RouteValidExpectation): void
    {
        const actual = new Route(expectation.pattern, constraints, transformers).match(expectation.value);

        assert.deepEqual(actual, expectation.expected);
    }

    @shouldFail
    @batchTest(routeInvalidExpectations, x => `Pattern: "${x.pattern}" should throws: "${x.error.message}"`)
    public invalidMatch(expectation: RouteInvalidExpectation): void
    {
        const action = (): RouteMatch => new Route(expectation.pattern, constraints, transformers).match(expectation.value);

        assert.throws(action, Error, expectation.error.message);
    }
}
