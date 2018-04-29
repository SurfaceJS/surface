import "./fixtures/dom";

import Expression                              from "@surface/expression";
import ICallExpression                         from "@surface/expression/interfaces/call-expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import ObserverVisitor                   from "../internal/observer-visitor";
import { observedAttributes }                  from "../internal/symbols";

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

        const expression = Expression.from("this.value", context);
        const visitor    = new ObserverVisitor(() => expect(context.this.value).to.equal(1));

        visitor.visit(expression);
        context.this.value += 1;
    }

    @test @shouldPass
    public observedAttributesNotify(): void
    {
        class Mock
        {
            public static [observedAttributes] = ["value"];
            private _value: number = 0;
            public get value(): number
            {
                return this._value;
            }

            public set value(value: number)
            {
                this._value = value;
            }

            public attributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                return;
            }
        }

        const context    = { this: new Mock() };
        const expression = Expression.from("this.value", context);
        const visitor    = new ObserverVisitor(() => expect(context.this.value).to.equal(1));

        visitor.visit(expression);
        context.this.value = 1;
        context.this["attributeChangedCallback"]("value", "0", "1", "");
    }

    @test @shouldPass
    public observedAttributesNotifyDifferentAttribute(): void
    {
        class Mock
        {
            public static [observedAttributes] = ["value"];
            private _value: number = 0;
            public get value(): number
            {
                return this._value;
            }

            public set value(value: number)
            {
                this._value = value;
            }

            public attributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                return;
            }
        }

        const context    = { this: new Mock() };
        const expression = Expression.from("this.value", context);
        const visitor    = new ObserverVisitor(() => expect(context.this.value).to.equal(1));

        visitor.visit(expression);
        context.this.value = 1;
        context.this["attributeChangedCallback"]("another-value", "0", "1", "");
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
        const visitor    = new ObserverVisitor(() => undefined);

        const invoker = (expression as ICallExpression).context.evaluate()![(expression as ICallExpression).name];

        visitor.visit(expression);

        expect(invoker).to.equal(Mock.prototype.increment);
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
        const visitor    = new ObserverVisitor(() => expect(context.this.value).to.equal(1));

        visitor.visit(expression);

        (context.this as Object)["value"] = 1;
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
        const visitor    = new ObserverVisitor(() => undefined);

        expect(() => visitor.visit(expression)).to.throw(Error, "Can't bind to non initialized object");
    }
}