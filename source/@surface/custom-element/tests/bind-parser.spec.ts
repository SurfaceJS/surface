import { category, suite, test } from "@surface/test-suite";
import { Action }                from "@surface/types";
import { expect }                from "chai";
import BindParser                from "../internal/bind-parser";

@suite("Bind Parser")
export default class BindParserSpec
{
    private testBind(notify?: Action): string
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

        const expression = BindParser.scan(context, "This is my value: {{ this.value }}", notify);
        return expression.evaluate() as string;
    }

    @category("Should work")
    @test("Scaped expression")
    public scapedExpression(): void
    {
        const context =
        {
            this: { }
        };

        const expression = BindParser.scan(context, "This is an scaped expression \\{{ this.value }}");
        const value = expression.evaluate();

        expect(value).to.equal("This is an scaped expression {{ this.value }}");
    }

    @category("Should work")
    @test("With notify")
    public withNotify(): void
    {
        expect(this.testBind(() => expect(true))).to.equal("This is my value: 0");
    }

    @category("Should work")
    @test("Without notify")
    public withoutNotify(): void
    {
        expect(this.testBind()).to.equal("This is my value: 0");
    }

    @category("Should throw")
    @test("Invalid identifier")
    public invalidIdentifier(): void
    {
        expect(() => BindParser.scan({ }, "This is my value: {{ this.value }}")).to.throw(Error, "The identifier this does not exist in this context");
    }
}