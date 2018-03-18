import FixtureElement from "./fixtures/fixture-element";

import BindExpressionVisitor from "../internal/bind-expression-visitor";

import Expression from "@surface/expression";

import { expect } from "chai";

describe
(
    "Bind should work",
    () =>
    {
        it
        (
            "One way",
            () =>
            {
                const context =
                {
                    this: new FixtureElement()
                };

                const expression = Expression.from("this.value", context);
                const visitor    = new BindExpressionVisitor(() => expect(expression.evaluate()).to.equal(2));

                visitor.visit(expression);

                context.this.value += 1;
            }
        );
    }
);