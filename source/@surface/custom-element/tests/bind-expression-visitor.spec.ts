import "./fixtures/dom";

import Expression            from "@surface/expression";
import { suite, test }       from "@surface/test-suite";
import { expect }            from "chai";
import BindExpressionVisitor from "../internal/bind-expression-visitor";
import FixtureElement        from "./fixtures/fixture-element";

@suite("Bind should work")
export class BindExpressionVisitorSpec
{
    @test("One way")
    public OneWay(): void
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
}