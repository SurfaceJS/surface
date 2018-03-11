import FixtureVisitor from "./fixtures/fixture-visitor";
import Expression     from "..";

import { expect } from "chai";

describe
(
    "Should work",
    () =>
    {
        const visitor = new FixtureVisitor();
        const expression = Expression.from("1");
        expect(visitor.visit(expression)).to.equal(expression);
    }
);