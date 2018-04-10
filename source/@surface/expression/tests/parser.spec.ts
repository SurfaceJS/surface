import { batchTest, shouldFail, shouldPass, suite } from "@surface/test-suite";
import { expect }                                   from "chai";
import Parser                                       from "../internal/parser";
import
{
    invalidExpressions,
    validExpressions,
    ExpressionFixtureSpec,
    InvalidExpressionFixtureSpec
} from "./fixtures/expressions";

@suite
export default class ParserSpec
{
    @shouldPass
    @batchTest(validExpressions, x => `expression (${x.raw}) should be evaluated to ${x.type.name}: ${x.value}`)
    public expressionsShouldWork(expression: ExpressionFixtureSpec): void
    {
        const result = Parser.parse(expression.raw, expression.context);
        expect(result.evaluate()).to.deep.equal(expression.value);
        expect(result).instanceof(expression.type);
    }

    @shouldFail
    @batchTest(invalidExpressions, x => `Expression (${x.raw}) should throw ${x.error.message}`)
    public expressionsShouldThrow(expression: InvalidExpressionFixtureSpec): void
    {
        try
        {
            Parser.parse(expression.raw, expression.context);
        }
        catch (error)
        {
            expect(error).to.includes(expression.error);
        }
    }
}