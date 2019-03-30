import "./fixtures/dom";

import { Indexer }                             from "@surface/core";
import Expression                              from "@surface/expression";
import ICallExpression                         from "@surface/expression/interfaces/call-expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import ObserverVisitor                         from "../internal/observer-visitor";

@suite
export class ObserverVisitorSpec
{
    @test @shouldPass
    public propertyNotify(): void
    {
        class Mock
        {
            private _value: number = 0;
            public get value(): number
            {
                return this._value;
            }

            public set value(value: number)
            {
                this._value = value;
            }
        }

        const context = { this: new Mock() };

        let value = 0;

        const expression = Expression.from("this.value", context);
        const visitor    = new ObserverVisitor({ notify: (x: number) => value = x });

        visitor.observe(expression);
        context.this.value += 1;

        chai.expect(value).to.equal(context.this.value);
    }

    @test @shouldPass
    public skipFunctionNotify(): void
    {
        class Mock
        {
            public increment(value: number): number
            {
                return ++value;
            }
        }

        const context    = { this: new Mock() };
        const expression = Expression.from("this.increment(1)", context);
        const visitor    = new ObserverVisitor({ notify: () => undefined });

        const invoker = ((expression as ICallExpression).context.evaluate() as Indexer)[(expression as ICallExpression).name];

        visitor.observe(expression);

        chai.expect(invoker).to.equal(Mock.prototype.increment);
    }

    @test @shouldPass
    public onlyHostWithoutSetter(): void
    {
        class MockWithoutSetter
        {
            public get value(): number
            {
                return 0;
            }
        }

        const context    = { this: new MockWithoutSetter() };
        const expression = Expression.from("this.value", context);
        const visitor    = new ObserverVisitor({ notify: () => chai.expect(context.this.value).to.equal(1) });

        visitor.observe(expression);

        (context.this as Indexer)["value"] = 1;
    }

    @test @shouldFail
    public bindToNonInitializedObject(): void
    {
        const context =
        {
            this:
            {
                data: undefined,
            }
        };

        const expression = Expression.from("this.data['value']", context);
        const visitor    = new ObserverVisitor({ notify: () => undefined });

        chai.expect(() => visitor.observe(expression)).to.throw(Error, "Can\'t make reactive a non initialized target");
    }
}