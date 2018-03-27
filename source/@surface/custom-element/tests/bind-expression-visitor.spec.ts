import Expression                              from "@surface/expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import BindExpressionVisitor                   from "../internal/bind-expression-visitor";
import { observedAttributes }                  from "../symbols";

@suite
export class BindExpressionVisitorSpec
{
    @test @shouldPass
    public objectPropertyBind(): void
    {
        const context =
        {
            this: new class Mock
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
            }()
        };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(() => expect(expression.evaluate()).to.equal(1));

        visitor.visit(expression);

        context.this.value += 1;
    }

    @test @shouldPass
    public objectObservedAttributesBind(): void
    {
        const context =
        {
            this: new class Mock
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
            }()
        };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(() => { return; });

        visitor.visit(expression);

        context.this.value += 1;
        context.this["attributeChangedCallback"]("anotherValue", "0", "1", "");
    }

    @test @shouldPass
    public objectWithoutAttributeChangedCallback(): void
    {
        const context =
        {
            this: new class Mock
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
            }()
        };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(() => { return; });

        visitor.visit(expression);
        context.this["attributeChangedCallback"]("value", 0, 1, "");
    }

    @test @shouldPass
    public objectSkipFunctionBind(): void
    {
        const context =
        {
            this: new class Mock
            {
                public doSomething(): void
                {
                    return;
                }
            }()
        };

        const expression = Expression.from("this.doSomething", context);
        const visitor    = new BindExpressionVisitor(() => expect(expression.evaluate()).to.equal(1));

        visitor.visit(expression);
    }

    @test @shouldPass
    public objectPropertyWithoutSetter(): void
    {
        const context =
        {
            this: new class Mock
            {
                public get value(): number
                {
                    return 0;
                }
            }()
        };

        const expression = Expression.from("this.value", context);
        const visitor    = new BindExpressionVisitor(() => { return; });

        visitor.visit(expression);

        (context.this as Object)["value"] = 1;
    }

    @test @shouldFail
    public objectInvalidBind(): void
    {
        const context =
        {
            this:
            {
                data:      new class Mock { }(),
                undefined: undefined
            }
        };

        const expression = Expression.from("this.data[this.undefined]", context);
        const visitor    = new BindExpressionVisitor(() => expect(expression.evaluate()).to.equal(1));

        expect(() => visitor.visit(expression)).to.throw(Error, "Can't bind to non initialized object");
    }
}