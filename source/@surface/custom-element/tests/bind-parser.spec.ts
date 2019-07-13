import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import BindParser                              from "../internal/bind-parser";

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
        const scope = { this: new Mock() };

        const expression = BindParser.scan("[[ this.value ]]");

        expect(expression.evaluate(scope)).to.equal(0);

        scope.this.value = 1;
        expect(expression.evaluate(scope)).to.equal(1);
    }

    @test @shouldPass
    public oneWayScapedExpression(): void
    {
        const expression = BindParser.scan("This is an scaped expression \\[[ this.value ]]");

        expect(expression.evaluate({ })).to.equal("This is an scaped expression [[ this.value ]]");
    }

    @test @shouldPass
    public oneWayBindWithInterpolation(): void
    {
        const scope = { this: new Mock() };

        const expression = BindParser.scan("The value is: [[ this.value ]]");

        expect(expression.evaluate({ })).to.deep.equal(["The value is: ", 0]);

        scope.this.value = 1;
        expect(expression.evaluate({ })).to.deep.equal(["The value is: ", 1]);
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

        const expression = BindParser.scan("{{ this.value }}");

        expect(expression.evaluate({ })).to.equal(0);

        context.this.value = 1;
        expect(expression.evaluate({ })).to.equal(1);
    }

    @test @shouldPass
    public twoWayExpression(): void
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

        const expression = BindParser.scan("{{ this.value > 0 }}");

        expect(expression.evaluate({ })).to.equal(false);

        context.this.value = 1;
        expect(expression.evaluate({ })).to.equal(true);
    }

    @test @shouldPass
    public twoWayBindWithInterpolation(): void
    {
        const context = { this: new Mock() };

        const expression = BindParser.scan("Value: {{ this.value }}; Text: {{ this.text }}");

        expect(expression.evaluate({ })).to.deep.equal(["Value: ", 0, "; Text: ", "Hello World!!!"]);

        context.this.value = 1;
        expect(expression.evaluate({ })).to.deep.equal(["Value: ", 1, "; Text: ", "Hello World!!!"]);

        context.this.text = "Updated!!!";
        expect(expression.evaluate({ })).to.deep.equal(["Value: ", 1, "; Text: ", "Updated!!!"]);
    }

    @test @shouldPass
    public twoWayScapedExpression(): void
    {
        const expression = BindParser.scan("This is an scaped expression \\{{ this.value }}");
        expect(expression.evaluate({ })).to.equal("This is an scaped expression {{ this.value }}");
    }

    @test @shouldFail
    public invalidIdentifier(): void
    {
        expect(() => BindParser.scan("This is my value: {{ this.value }}")).to.throw(Error, "The identifier this does not exist in this context");
    }

    @test @shouldFail
    public invalidIndentifier(): void
    {
        expect(() => BindParser.scan("This is my value: {{ this }}")).to.throw(Error, "The identifier this does not exist in this context");
    }

    @test @shouldFail
    public invalidSyntax(): void
    {
        expect(() => BindParser.scan("This is my value: {{ this.? }}")).to.throw(Error, "Unexpected token ? at posistion 6");
    }
}