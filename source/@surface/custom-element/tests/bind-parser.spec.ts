import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import BindParser                              from "../internal/bind-parser";
import BindingMode                             from "../internal/binding-mode";

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

    private _text: string = "Hello World!!!";
    public get text(): string
    {
        return this._text;
    }

    public set text(value: string)
    {
        this._text = value;
    }
}

@suite
export default class BindParserSpec
{
    @test @shouldPass
    public oneWayBind(): void
    {
        const context = { this: new Mock() };

        const { bindingMode, expression } = BindParser.scan(context, "[[ this.value ]]");

        expect(bindingMode).to.equal(BindingMode.oneWay);
        expect(expression.evaluate()).to.equal(0);

        context.this.value = 1;
        expect(expression.evaluate()).to.equal(1);
    }

    @test @shouldPass
    public oneWayScapedExpression(): void
    {
        const { bindingMode, expression } = BindParser.scan({ }, "This is an scaped expression \\[[ this.value ]]");

        expect(bindingMode).to.equal(BindingMode.oneWay);
        expect(expression.evaluate()).to.equal("This is an scaped expression [[ this.value ]]");
    }

    @test @shouldPass
    public oneWayBindWithInterpolation(): void
    {
        const context = { this: new Mock() };

        const { bindingMode, expression } = BindParser.scan(context, "The value is: [[ this.value ]]");

        expect(bindingMode).to.equal(BindingMode.oneWay);
        expect(expression.evaluate()).to.equal("The value is: 0");

        context.this.value = 1;
        expect(expression.evaluate()).to.equal("The value is: 1");
    }

    @test @shouldPass
    public twoWayBind(): void
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

        const { bindingMode, expression } = BindParser.scan(context, "{{ this.value }}");

        expect(bindingMode).to.equal(BindingMode.twoWay);
        expect(expression.evaluate()).to.equal(0);

        context.this.value = 1;
        expect(expression.evaluate()).to.equal(1);
    }

    @test @shouldPass
    public twoWayBindWithInterpolation(): void
    {
        const context = { this: new Mock() };

        const { bindingMode, expression } = BindParser.scan(context, "Value: {{ this.value }}; Text: {{ this.text }}");

        expect(bindingMode).to.equal(BindingMode.oneWay);
        expect(expression.evaluate()).to.equal("Value: 0; Text: Hello World!!!");

        context.this.value = 1;
        expect(expression.evaluate()).to.equal("Value: 1; Text: Hello World!!!");

        context.this.text = "Updated!!!";
        expect(expression.evaluate()).to.equal("Value: 1; Text: Updated!!!");
    }

    @test @shouldPass
    public twoWayScapedExpression(): void
    {
        const expressionBind = BindParser.scan({ }, "This is an scaped expression \\{{ this.value }}");
        expect(expressionBind.expression.evaluate()).to.equal("This is an scaped expression {{ this.value }}");
    }

    @test @shouldFail
    public invalidIdentifier(): void
    {
        expect(() => BindParser.scan({ }, "This is my value: {{ this.value }}")).to.throw(Error, "The identifier this does not exist in this context");
    }
}