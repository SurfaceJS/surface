import FixtureVisitor from "./fixtures/fixture-visitor";
import Expression     from "..";

import { validVisitors } from "./fixtures/visitors";

import { expect } from "chai";

describe
(
    "Expression Visitor",
    () =>
    {
        describe
        (
            "Visits should work",
            () =>
            {
                for (const spec of validVisitors)
                {
                    const visitor  = new FixtureVisitor();
                    let expression = Expression.from(spec.raw, spec.context);

                    it(`Visit ${spec.value}`, () => expect(visitor.visit(expression).evaluate()).to.equal(spec.value));
                }
            }
        );
    }
);