import "./fixtures/dom";

import { SyntaxError }                         from "@surface/expression";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import InterpolatedExpression                  from "../internal/interpolated-expression";

type RawError = { message: string }|Pick<SyntaxError, "message"|"lineNumber"|"index"|"column">;

function parseWithError(expression: string): RawError|null
{
    try
    {
        InterpolatedExpression.parse(expression);
    }
    catch (error)
    {
        return toRaw(error);
    }

    return null;
}

function toRaw(error: Error): RawError
{
    if (error instanceof SyntaxError)
    {
        return {
            message:    error.message,
            lineNumber: error.lineNumber,
            index:      error.index,
            column:     error.column
        };
    }
    else
    {
        return { message: error.message };
    }
}

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
    public expressionWithoutInterpolation(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("{this.value}");

        assert.deepEqual(expression.evaluate(scope), [0]);

        scope.this.value = 1;
        assert.deepEqual(expression.evaluate(scope), [1]);
    }

    @test @shouldPass
    public interpolationAtStart(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("{ this.value } value at start");

        assert.deepEqual(expression.evaluate(scope), [0, " value at start"]);

        scope.this.value = 1;
        assert.deepEqual(expression.evaluate(scope), [1, " value at start"]);
    }

    @test @shouldPass
    public interpolationAtMiddle(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("Value { this.value } at middle");

        assert.deepEqual(expression.evaluate(scope), ["Value ", 0, " at middle"]);

        scope.this.value = 1;
        assert.deepEqual(expression.evaluate(scope), ["Value ", 1, " at middle"]);
    }

    @test @shouldPass
    public interpolationAtEnd(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("value at end { this.value }");

        assert.deepEqual(expression.evaluate(scope), ["value at end ", 0]);

        scope.this.value = 1;
        assert.deepEqual(expression.evaluate(scope), ["value at end ", 1]);
    }

    @test @shouldPass
    public interpolationAround(): void
    {
        const scope = { this: new Mock() };

        const expression = InterpolatedExpression.parse("{ this.value } text at center { this.text }");

        assert.deepEqual(expression.evaluate(scope), [0, " text at center ", "Hello World!!!"]);

        scope.this.value = 1;
        scope.this.text  = "Just Hello!";
        assert.deepEqual(expression.evaluate(scope), [1, " text at center ", "Just Hello!"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideDoubleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { \" double quoted string } - { \" } inside");

        assert.deepEqual(expression.evaluate({ }), ["interpolatation with ", " double quoted string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideScapedDoubleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { \" double \\\"quoted\\\" string } - { \" } inside");

        assert.deepEqual(expression.evaluate({ }), ["interpolatation with ", " double \"quoted\" string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideSingleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ' single quoted string } - { ' } inside");

        assert.deepEqual(expression.evaluate({ }), ["interpolatation with ", " single quoted string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideScapedSingleQuotedString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ' single \\'quoted\\' string } - { ' } inside");

        assert.deepEqual(expression.evaluate({ }), ["interpolatation with ", " single 'quoted' string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideTemplateString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ` template single string } - { ` } inside");

        assert.deepEqual(expression.evaluate({ }), ["interpolatation with ", " template single string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideScapedTemplateString(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ` template \\`single\\` string } - { ` } inside");

        assert.deepEqual(expression.evaluate({ }), ["interpolatation with ", " template `single` string } - { ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideTemplateStringAndTemplateInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { ` template single ${ `value: ` + \"1\"} ` } inside");

        assert.deepEqual(expression.evaluate({  }), ["interpolatation with ", " template single value: 1 ", " inside"]);
    }

    @test @shouldPass
    public interpolationWithBracketInsideTemplateAndStringAndConditionalTemplateInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("interpolatation with { value == 'default' ? '' : `${value} expression` } inside");

        assert.deepEqual(expression.evaluate({ value: "conditional" }), ["interpolatation with ", "conditional expression", " inside"]);
    }

    @test @shouldPass
    public scapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an scaped expression \\{ this.value }");

        assert.deepEqual(expression.evaluate({ }), ["This is an scaped expression { this.value }"]);
    }

    @test @shouldPass
    public scapedScapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an scaped expression \\\\{ 'scaped' }");

        assert.deepEqual(expression.evaluate({ }), ["This is an scaped expression \\", "scaped"]);
    }

    @test @shouldPass
    public interpolationAndScapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an scaped expression \\{ { 'scaped' } }");

        assert.deepEqual(expression.evaluate({ }), ["This is an scaped expression { ", "scaped", " }"]);
    }

    @test @shouldPass
    public complexScapedInterpolation(): void
    {
        const expression = InterpolatedExpression.parse("This is an { '\\'very\\'' } complex \\{scaped} \\\\{ 'interpolation' } \\}");

        assert.deepEqual(expression.evaluate({ }), ["This is an ", "\'very\'", " complex {scaped} \\", "interpolation", " \\}"]);
    }

    @test @shouldFail
    public unclosedBrancket(): void
    {
        assert.deepEqual(parseWithError("This { Should throw"), toRaw(new SyntaxError("Unexpected end of expression", 1, 18, 19)));
        assert.deepEqual(parseWithError("This { 'Should throw' "), toRaw(new SyntaxError("Unexpected end of expression", 1, 21, 22)));

        assert.deepEqual(parseWithError("This\n{\nShould\nthrow"), toRaw(new SyntaxError("Unexpected end of expression", 4, 18, 19)));
        assert.deepEqual(parseWithError("This\n{\n'Should\nthrow' "), toRaw(new SyntaxError("Unexpected end of expression", 4, 21, 22)));
    }

    @test @shouldFail
    public unclosedString(): void
    {
        assert.deepEqual(parseWithError("This { 'Should throw }"), toRaw(new SyntaxError("Unexpected end of expression", 1, 21, 22)));
        assert.deepEqual(parseWithError("This { `Should throw }"), toRaw(new SyntaxError("Unexpected end of expression", 1, 21, 22)));
        assert.deepEqual(parseWithError("This { 'Should throw\" }"), toRaw(new SyntaxError("Unexpected end of expression", 1, 22, 23)));
        assert.deepEqual(parseWithError("This { 'Should throw\\' }"), toRaw(new SyntaxError("Unexpected end of expression", 1, 23, 24)));

        assert.deepEqual(parseWithError("This\n{\n'Should\nthrow }"), toRaw(new SyntaxError("Unexpected end of expression", 4, 21, 22)));
        assert.deepEqual(parseWithError("This\n{\n`Should\nthrow\" }"), toRaw(new SyntaxError("Unexpected end of expression", 4, 22, 23)));
        assert.deepEqual(parseWithError("This\n{\n'Should\nthrow\" }"), toRaw(new SyntaxError("Unexpected end of expression", 4, 22, 23)));
        assert.deepEqual(parseWithError("This\n{\n'Should\nthrow\\' }"), toRaw(new SyntaxError("Unexpected end of expression", 4, 23, 24)));
    }

    @test @shouldFail
    public unclosedTemplateBrackedString(): void
    {
        assert.deepEqual(parseWithError("This { `Should ${'throw'` }"), toRaw(new SyntaxError("Unexpected end of expression", 1, 26, 27)));

        assert.deepEqual(parseWithError("This\n{\n`Should ${'throw'` }"), toRaw(new SyntaxError("Unexpected end of expression", 3, 26, 27)));
    }

    @test @shouldFail
    public invalidSyntax(): void
    {
        assert.deepEqual(parseWithError("This is my value: { this.? }"), toRaw(new SyntaxError("Unexpected token ?", 1, 25, 26)));
        assert.deepEqual(parseWithError("This \n is \n my \n value: { \n this.? }"), toRaw(new SyntaxError("Unexpected token ?", 5, 33, 7)));
    }
}