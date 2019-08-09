import { batchTest, shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                               from "chai";
import Expression                                         from "..";
import Messages                                           from "../internal/messages";
import NodeType                                           from "../node-type";
import
{
    evaluationsExpected,
    expressionFactoriesExpected,
    EvaluationErrorExpected,
    ExpressionFactoryExpected
}
from "./expectations/expression-expected";

@suite
export default class ExpressionSpec
{
    @shouldPass
    @batchTest(expressionFactoriesExpected, x => `method Expression.${x.method} should return ${NodeType[x.type]} Expression`)
    public expressionFactory(expressionFactoryExpected: ExpressionFactoryExpected)
    {
        const expression = expressionFactoryExpected.factory();

        chai.expect(expression.type).to.equal(expressionFactoryExpected.type);
        chai.expect(expression.toString()).to.equal(expressionFactoryExpected.toString);
    }

    @test @shouldPass
    public parse()
    {
        const expression = Expression.parse("this");

        chai.expect(expression.type).to.equal(NodeType.ThisExpression);
    }

    @test @shouldPass
    public regExpLiteral()
    {
        const expression = Expression.regex("foo", "gi");

        chai.expect(expression.pattern, "pattern").to.equal("foo");
        chai.expect(expression.flags, "flags").to.equal("gi");
        chai.expect(expression.value, "value").to.equal(null);
        chai.expect(expression.evaluate(), "evaluate").to.deep.equal(/foo/gi);
        chai.expect(expression.evaluate(void 0, true), "evaluate with cache").to.deep.equal(/foo/gi);
        chai.expect(expression.toString(), "toString").to.deep.equal("/foo/gi");
    }

    @shouldFail
    @batchTest(evaluationsExpected, x => `evaluate: ${x.raw}; should throw ${x.error.message}`)
    public evaluationsShouldThrow(evaluationErrorExpected: EvaluationErrorExpected): void
    {
        try
        {
            Expression.parse(evaluationErrorExpected.raw).evaluate(evaluationErrorExpected.scope);

            throw new Error(`Evaluate: ${evaluationErrorExpected.raw}; not throw`);
        }
        catch (error)
        {
            chai.expect(error.message).to.equal(evaluationErrorExpected.error.message);
            chai.expect(error).to.includes(evaluationErrorExpected.error);
        }
    }

    @test @shouldFail
    public arrowFunctionWithDuplicatedParameters()
    {
        const parameters    = [Expression.identifier("a"), Expression.identifier("a") ];
        const body          = Expression.identifier("x");

        chai.expect(() => Expression.arrowFunction(parameters, body)).to.throw(Messages.duplicateParameterNameNotAllowedInThisContext);
    }

    @test @shouldFail
    public arrowFunctionWithInvalidAssignmentPattern(): void
    {
        const parameters    = [Expression.assignmentPattern(Expression.arrayPattern([]), Expression.literal(1))];
        const body          = Expression.identifier("x");
        const arrowFunction = Expression.arrowFunction(parameters, body);

        chai.expect(arrowFunction.evaluate({ })).to.throw(Messages.illegalPropertyInDeclarationContext);
    }
}