import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import InterpolatedExpression                          from "../internal/interpolated-expression";

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
export default class InterpolatedExpressionSpec
{
    @test @shouldPass
    public cache(): void
    {
        const expression = InterpolatedExpression.parse("Use cache");

        expect(expression.evaluate({ })).to.deep.equal(["Use cache"]);

        expect(InterpolatedExpression.parse("Use cache")).to.equal(expression);
    }

    @test @shouldPass
    public expressionWithoutInterpolation(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("{this.value}");

        expect(expression.evaluate(scope)).to.deep.equal([0]);

        scope.this.value = 1;
        expect(expression.evaluate(scope)).to.deep.equal([1]);
    }

    @test @shouldPass
    public interpolationAtStart(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("{ this.value } value at start");

        expect(expression.evaluate(scope)).to.deep.equal([0, " value at start"]);

        scope.this.value = 1;
        expect(expression.evaluate(scope)).to.deep.equal([1, " value at start"]);
    }

    @test @shouldPass
    public interpolationAtMiddle(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("Value { this.value } at middle");

        expect(expression.evaluate(scope)).to.deep.equal(["Value ", 0, " at middle"]);

        scope.this.value = 1;
        expect(expression.evaluate(scope)).to.deep.equal(["Value ", 1, " at middle"]);
    }

    @test @shouldPass
    public interpolationAtEnd(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("value at end { this.value }");

        expect(expression.evaluate(scope)).to.deep.equal(["value at end ", 0]);

        scope.this.value = 1;
        expect(expression.evaluate(scope)).to.deep.equal(["value at end ", 1]);
    }

    @test @shouldPass
    public interpolationAround(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("{ this.value } text at center { this.text }");

        expect(expression.evaluate(scope)).to.deep.equal([0, " text at center ", "Hello World!!!"]);

        scope.this.value = 1;
        scope.this.text  = "Just Hello!";
        expect(expression.evaluate(scope)).to.deep.equal([1, " text at center ", "Just Hello!"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideDoubleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { \" double quoted string } - { \" } inside");

        expect(expression.evaluate({ })).to.deep.equal(["interpolatation with ", " double quoted string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideScapedDoubleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { \" double \\\"quoted\\\" string } - { \" } inside");

        expect(expression.evaluate({ })).to.deep.equal(["interpolatation with ", " double \"quoted\" string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideSingleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ' single quoted string } - { ' } inside");

        expect(expression.evaluate({ })).to.deep.equal(["interpolatation with ", " single quoted string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideScapedSingleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ' single \\'quoted\\' string } - { ' } inside");

        expect(expression.evaluate({ })).to.deep.equal(["interpolatation with ", " single 'quoted' string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideTemplateString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ` template single string } - { ` } inside");

        expect(expression.evaluate({ })).to.deep.equal(["interpolatation with ", " template single string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideScapedTemplateString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ` template \\`single\\` string } - { ` } inside");

        expect(expression.evaluate({ })).to.deep.equal(["interpolatation with ", " template `single` string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideTemplateStringAndTemplateInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ` template single ${ `value: ` + \"1\"} ` } inside");

        expect(expression.evaluate({  })).to.deep.equal(["interpolatation with ", " template single value: 1 ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideTemplateAndStringAndConditionalTemplateInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { value == 'default' ? '' : `${value} expression` } inside");

        expect(expression.evaluate({ value: "conditional" })).to.deep.equal(["interpolatation with ", "conditional expression", " inside"]);
    }

    @test @shouldPass
    public scapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an scaped expression \\{ this.value }");

        expect(expression.evaluate({ })).to.deep.equal(["This is an scaped expression { this.value }"]);
    }

    @test @shouldPass
    public scapedScapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an scaped expression \\\\{ 'scaped' }");

        expect(expression.evaluate({ })).to.deep.equal(["This is an scaped expression \\", "scaped"]);
    }

    @test @shouldPass
    public interpolationAndScapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an scaped expression \\{ { 'scaped' } }");

        expect(expression.evaluate({ })).to.deep.equal(["This is an scaped expression { ", "scaped", " }"]);
    }

    @test @shouldPass
    public complexScapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an { '\\'very\\'' } complex \\{scaped} \\\\{ 'interpolation' } \\}");

        expect(expression.evaluate({ })).to.deep.equal(["This is an ", "\'very\'", " complex {scaped} \\", "interpolation", " \\}"]);
    }

    @test @shouldFail
    public unclosedBrancket(): void
    {
        expect(() => InterpolatedExpression.parse("This { Should throw")).to.throw(Error, "Unexpected end of expression");
        expect(() => InterpolatedExpression.parse("This { 'Should throw' ")).to.throw(Error, "Unexpected end of expression");
    }

    @test @shouldFail
    public unclosedString(): void
    {
        expect(() => InterpolatedExpression.parse("This { 'Should throw }")).to.throw(Error, "Unexpected end of expression");
        expect(() => InterpolatedExpression.parse("This { 'Should throw\" }")).to.throw(Error, "Unexpected end of expression");
        expect(() => InterpolatedExpression.parse("This { 'Should throw\\' }")).to.throw(Error, "Unexpected end of expression");
    }

    @test @shouldFail
    public invalidSyntax(): void
    {
        expect(() => InterpolatedExpression.parse("This is my value: { this.? }")).to.throw(Error, "Unexpected token ? at posistion 6");
    }
}