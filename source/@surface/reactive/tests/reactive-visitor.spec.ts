import Expression                  from "@surface/expression";
import { shouldPass, suite, test } from "@surface/test-suite";
import * as chai                   from "chai";
import Reactive                    from "..";
import ReactiveVisitor             from "../internal/reactive-visitor";

@suite
export default class ReactiveVisitorSpec
{
    @test @shouldPass
    public visitMemberExpression(): void
    {
        const scope =
        {
            a: { instance: { very: { deep: { path: { value: 1 } } } } },
            b: { instance: { very: { deep: { path: { value: 2 } } } } },
            c: { instance: { very: { deep: { path: { value: 3 } } } } },
        };

        let value = true;

        const expression = Expression.from("a.instance.very.deep.path.value == b.instance.very['deep'].path.value || a.instance.very.deep.path.value > c.instance.very.deep.path.value");

        const notification = () => value = expression.evaluate(scope) as boolean;

        const visitor = new ReactiveVisitor({ notify: notification }, scope);

        visitor.observe(expression);

        notification();

        const reactor = Reactive.getReactor(scope);

        chai.expect(reactor);

        chai.expect(value).to.equal(false);

        scope.a.instance.very.deep.path.value = 2;

        chai.expect(value).to.equal(true);

        scope.b = { instance: { very: { deep: { path: { value: 1 } } } } };

        chai.expect(value).to.equal(false);

        scope.c.instance.very = { deep: { path: { value: 0 } } };

        chai.expect(value).to.equal(true);
    }

    @test @shouldPass
    public visitCallExpression(): void
    {
        const scope =
        {
            a:     { instance: { invoke: (value: number) => ({ very: { deep: { path: { value } } } }) } },
            value: 1
        };

        let value = 0;

        const expression = Expression.from("a.instance.invoke(value).very.deep['path'].value");

        const notification = () => value = expression.evaluate(scope) as number;

        const visitor = new ReactiveVisitor({ notify: notification }, scope);

        visitor.observe(expression);

        const reactor = Reactive.getReactor(scope);

        chai.expect(reactor);

        notification();

        chai.expect(value).to.equal(1);

        scope.value = 2;

        chai.expect(value).to.equal(2);

        scope.a.instance = { invoke: (value: number) => ({ very: { deep: { path: { value: value * 2 } } } }) };

        chai.expect(value).to.equal(4);

        scope.a.instance.invoke(1);

        chai.expect(value).to.equal(4);
    }

    @test @shouldPass
    public visitIndexAcessedExpression(): void
    {
        const scope =
        {
            a:
            {
                instance:
                {
                    items:
                    [
                        { very: { deep: { path: { value: 1 } } } },
                        { very: { deep: { path: { value: 2 } } } },
                        { very: { deep: { path: { value: 3 } } } },
                        { very: { deep: { path: { value: 4 } } } },
                        { very: { deep: { path: { value: 5 } } } }
                    ]
                }
            }
        };

        let value = 0;

        const expression = Expression.from("a.instance.items[3].very.deep['path'].value");

        const notification = (x: number) => value = x;

        const visitor = new ReactiveVisitor({ notify: notification }, scope);

        visitor.observe(expression);

        const reactor = Reactive.getReactor(scope);

        chai.expect(reactor);

        scope.a.instance.items.splice(0, 1);

        chai.expect(value).to.equal(5, "#01");

        scope.a.instance.items.reverse();

        chai.expect(value).to.equal(2, "#02");

        scope.a.instance.items.pop();

        scope.a.instance.items.reverse();

        scope.a.instance.items.push({ very: { deep: { path: { value: 6 } } } },);

        chai.expect(value).to.equal(6, "#03");
    }
}