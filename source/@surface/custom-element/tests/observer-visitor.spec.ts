import "./fixtures/dom";

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

        const scope = { this: new Mock() };

        let value = 0;

        const expression = Expression.parse("this.value");
        const visitor    = new ObserverVisitor({ notify: (x: number) => value = x }, scope);

        visitor.observe(expression);
        scope.this.value += 1;

        chai.expect(value).to.equal(scope.this.value);
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

        const scope      = { this: new Mock() };
        const expression = Expression.parse("this.increment(1)");
        const visitor    = new ObserverVisitor({ notify: () => undefined }, scope);

        const invoker = (expression as ICallExpression).callee.evaluate(scope);

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

        const scope    = { this: new MockWithoutSetter() };
        const expression = Expression.parse("this.value");
        const visitor    = new ObserverVisitor({ notify: () => chai.expect(scope.this.value).to.equal(1) }, scope);

        visitor.observe(expression); // Todo: Review scenario

        chai.expect(true);
    }

    @test @shouldFail
    public bindToNonInitializedObject(): void
    {
        const expression = Expression.parse("this.data['value']");
        const visitor    = new ObserverVisitor({ notify: () => undefined }, { this: { data: undefined } });

        chai.expect(() => visitor.observe(expression)).to.throw(Error, "Can\'t make reactive a non initialized target");
    }
}