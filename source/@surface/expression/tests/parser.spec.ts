import { batchTest, category, suite } from "@surface/test-suite";
import { expect }                     from "chai";
import Parser                         from "../internal/parser";
import
{
    invalidExpressions,
    validExpressions,
    ExpressionFixtureSpec,
    InvalidExpressionFixtureSpec
} from "./fixtures/expressions";

@suite("Parser")
export default class ParserSpec
{
    @category("Parsing should work")
    @batchTest(validExpressions, x => `Expression ${x.raw} must be evaluated to ${x.type.name}: ${x.value}`)
    public expressionsShouldWork(expression: ExpressionFixtureSpec): void
    {
        const result = Parser.parse(expression.raw, expression.context);
        expect(result.evaluate()).to.deep.equal(expression.value);
        expect(result).instanceof(expression.type);
    }

    @category("Parsing should throw")
    @batchTest(invalidExpressions, x => `Expression ${x.raw} must throw an error`)
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