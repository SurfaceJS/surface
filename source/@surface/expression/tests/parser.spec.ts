import { batchTest, shouldFail, shouldPass, suite } from "@surface/test-suite";
import * as chai                                    from "chai";
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

        chai.expect(result.evaluate(), "evaluate").to.deep.equal(expression.value);
        chai.expect(result, "instanceof").instanceof(expression.type);
        chai.expect(result.toString(), "toString").to.equal(expression.toString);
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
            chai.expect(error.message).to.equal(expression.error.message);
            chai.expect(error).to.includes(expression.error);
        }
    }
}