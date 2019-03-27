import Expression                              from "@surface/expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import Reactive                                from "..";
import ReactiveVisitor                         from "../internal/reactive-visitor";

@suite
export default class ReactiveVisitorSpec
{
    @test @shouldPass
    public visitMemberExpression(): void
    {
        const context =
        {
            a: { instance: { very: { deep: { path: { value: 1 } } } } },
            b: { instance: { very: { deep: { path: { value: 2 } } } } },
            c: { instance: { very: { deep: { path: { value: 3 } } } } },
        };

        let value = true;

        const expression = Expression.from("a.instance.very.deep.path.value == b.instance.very['deep'].path.value || a.instance.very.deep.path.value > c.instance.very.deep.path.value", context);

        const notification = () => value = expression.evaluate() as boolean;

        const visitor = new ReactiveVisitor({ notify: notification });

        visitor.visit(expression);

        notification();

        const reactor = Reactive.getReactor(context);

        chai.expect(reactor);

        chai.expect(value).to.equal(false);

        context.a.instance.very.deep.path.value = 2;

        chai.expect(value).to.equal(true);

        context.b = { instance: { very: { deep: { path: { value: 1 } } } } };

        chai.expect(value).to.equal(false);

        context.c.instance.very = { deep: { path: { value: 0 } } };

        chai.expect(value).to.equal(true);
    }

    @test @shouldPass
    public visitCallExpression(): void
    {
        const context =
        {
            a:     { instance: { invoke: (value: number) => ({ very: { deep: { path: { value } } } }) } },
            value: 1
        };

        let value = 0;

        const expression = Expression.from("a.instance.invoke(value).very.deep['path'].value", context);

        const notification = () => value = expression.evaluate() as number;

        const visitor = new ReactiveVisitor({ notify: notification });

        visitor.visit(expression);

        const reactor = Reactive.getReactor(context);

        chai.expect(reactor);

        notification();

        chai.expect(value).to.equal(1);

        context.value = 2;

        chai.expect(value).to.equal(2);

        context.a.instance = { invoke: (value: number) => ({ very: { deep: { path: { value: value * 2 } } } }) };

        chai.expect(value).to.equal(4);

        context.a.instance.invoke(1);

        chai.expect(value).to.equal(4);
    }

    @test @shouldFail
    public invalidKey(): void
    {
        chai.expect([]);
    }
}