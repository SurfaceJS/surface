import "./fixtures/dom";

import Expression                from "@surface/expression";
import { category, suite, test } from "@surface/test-suite";
import { expect }                from "chai";
import BindExpressionVisitor     from "../internal/bind-expression-visitor";
import Dummy                     from "./fixtures/dummy";
import FixtureElement            from "./fixtures/fixture-element";

@suite("Bind expression visitor")
export class BindExpressionVisitorSpec
{
    @category("Should work")
    @test("Custom element one way")
    public customeElementOneWay(): void
    {
        const context =
        {
            this: new FixtureElement()
        };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(() => expect(expression.evaluate()).to.equal(1));

        visitor.visit(expression);

        context.this.value += 1;
    }

    @category("Should work")
    @test("object one way")
    public objectOneWay(): void
    {
        const context = { this: new Dummy() };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(() => expect(expression.evaluate()).to.equal(1));

        visitor.visit(expression);

        context.this.value += 1;
    }
}