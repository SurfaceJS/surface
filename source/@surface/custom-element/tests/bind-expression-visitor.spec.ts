import Expression                from "@surface/expression";
import { category, suite, test } from "@surface/test-suite";
import { expect }                from "chai";
import BindExpressionVisitor     from "../internal/bind-expression-visitor";
import { observedAttributes }    from "../symbols";

@suite("Bind expression visitor")
export class BindExpressionVisitorSpec
{
    @category("Should work")
    @test("Object bind")
    public customeElementOneWay(): void
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

    @category("Should work")
    @test("Object observedAttributes bind")
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

    @category("Should work")
    @test("Object Without Attribute Changed Callback")
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

    @category("Should work")
    @test("Object skip function bind")
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

    @category("Should work")
    @test("Object property without setter")
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

    @category("Should throw")
    @test("Non initialized object")
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