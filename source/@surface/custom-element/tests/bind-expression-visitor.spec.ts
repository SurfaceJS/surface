import "./fixtures/dom";

import Expression                              from "@surface/expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import BindExpressionVisitor                   from "../internal/bind-expression-visitor";
import BindingMode                             from "../internal/binding-mode";
import { observedAttributes }                  from "../internal/symbols";

@suite
export class BindExpressionVisitorSpec
{
    @test @shouldPass
    public propertyBind(): void
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

        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "value");

        visitor.visit(expression);

        host.value = 2;
        context.this.value += 1;
    }

    @test @shouldPass
    public observedAttributesBind(): void
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

        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "value", () => { return; });

        visitor.visit(expression);

        context.this.value += 1;
        context.this["attributeChangedCallback"]("anotherValue", "0", "1", "");
    }

    @test @shouldPass
    public observedAttributesJustNotify(): void
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

        const context = { this: new Mock() };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, new Mock(), "value", () => undefined);

        visitor.visit(expression);

        context.this.value += 1;
        context.this["attributeChangedCallback"]("value", "0", "1", "");
    }

    @test @shouldPass
    public objectWithoutAttributeChangedCallback(): void
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
        }

        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "value");

        visitor.visit(expression);
        context.this["attributeChangedCallback"]("value", 0, 1, "");
    }

    @test @shouldPass
    public skipUpwardFunctionBind(): void
    {
        class Mock
        {
            public doSomething(): void
            {
                return;
            }
        }

        class HostMock
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

        const host       = new HostMock();
        const context    = { this: new Mock() };
        const expression = Expression.from("this.doSomething", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "value");

        visitor.visit(expression);

        host.value = 1;
        expect(context.this.doSomething).to.equal(Mock.prototype.doSomething);
    }

    @test @shouldPass
    public skipDonwardFunctionBind(): void
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

        class HostMock
        {
            public doSomething(): void
            {
                return;
            }
        }

        const host       = new HostMock();
        const context    = { this: new Mock() };
        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "doSomething");

        visitor.visit(expression);

        context.this.value = 1;
        expect(host.doSomething).to.equal(HostMock.prototype.doSomething);
    }

    @test @shouldPass
    public targetAndHostWithoutSetter(): void
    {
        class Mock
        {
            public get value(): number
            {
                return 0;
            }
        }

        const host       = new Mock();
        const context    = { this: new Mock() };
        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "value");

        visitor.visit(expression);

        (context.this as Object)["value"] = 1;
        (host as Object)["value"]       = 1;
    }

    @test @shouldPass
    public onlyHostWithoutSetter(): void
    {
        class MockWithSetter
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

        class MockWithoutSetter
        {
            public get value(): number
            {
                return 0;
            }
        }

        const host       = new MockWithSetter();
        const context    = { this: new MockWithoutSetter() };
        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "value");

        visitor.visit(expression);

        (context.this as Object)["value"] = 1;
        (host as Object)["value"]       = 1;
    }

    @test @shouldFail
    public bindToNonInitializedObject(): void
    {
        class Mock{ }

        const context =
        {
            this:
            {
                data: undefined,
            }
        };

        const host       = new Mock();
        const expression = Expression.from("this.data['value']", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "");

        expect(() => visitor.visit(expression)).to.throw(Error, "Can't bind to non initialized object");
    }

    @test @shouldFail
    public invalidBind(): void
    {
        class Mock { }

        const context =
        {
            this:
            {
                data:      new Mock(),
                undefined: undefined
            }
        };

        const host       = new Mock();
        const expression = Expression.from("this.data.value", context);
        const visitor    = new BindExpressionVisitor(BindingMode.twoWay, host, "");

        expect(() => visitor.visit(expression)).to.throw(Error, "Property does not exist on target object");
    }
}