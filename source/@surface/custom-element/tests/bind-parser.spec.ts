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
}

@suite
export default class BindParserSpec
{
    @test @shouldPass
    public oneWayBind(): void
    {
        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = BindParser.scan(context, "[[ this.value ]]", host, "value");
        expect(expression.evaluate()).to.equal(0);

        context.this.value = 1;
        expect(expression.evaluate()).to.equal(1);

        host.value = 2;
        expect(expression.evaluate()).to.equal(1);
    }

    @test @shouldPass
    public oneWayScapedExpression(): void
    {
        const expression = BindParser.scan({ }, "This is an scaped expression \\[[ this.value ]]", { }, "");
        expect(expression.evaluate()).to.equal("This is an scaped expression [[ this.value ]]");
    }

    @test @shouldPass
    public oneWayBindWithInterpolation(): void
    {
        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = BindParser.scan(context, "The value is: [[ this.value ]]", host, "value");

        expect(expression.evaluate()).to.equal("The value is: 0");

        context.this.value = 1;
        expect(expression.evaluate()).to.equal("The value is: 1");

        host.value = 2;
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

        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = BindParser.scan(context, "{{ this.value }}", host, "value");

        expect(expression.evaluate()).to.equal(0);

        context.this.value = 1;
        expect(expression.evaluate()).to.equal(1);

        host.value = 2;
        expect(expression.evaluate()).to.equal(2);
    }

    @test @shouldPass
    public twoWayBindWithInterpolation(): void
    {
        const host    = new Mock();
        const context = { this: new Mock() };

        const expression = BindParser.scan(context, "The value is: {{ this.value }}", host, "value");

        expect(expression.evaluate()).to.equal("The value is: 0");

        context.this.value = 1;
        expect(expression.evaluate()).to.equal("The value is: 1");

        host.value = 2;
        expect(expression.evaluate()).to.equal("The value is: 1");
    }

    @test @shouldPass
    public twoWayScapedExpression(): void
    {
        const expression = BindParser.scan({ }, "This is an scaped expression \\{{ this.value }}", { }, "");
        expect(expression.evaluate()).to.equal("This is an scaped expression {{ this.value }}");
    }

    @test @shouldFail
    @test("Invalid identifier")
    public invalidIdentifier(): void
    {
        expect(() => BindParser.scan({ }, "This is my value: {{ this.value }}", { }, "")).to.throw(Error, "The identifier this does not exist in this context");
    }
}