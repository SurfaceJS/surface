import { batchTest, shouldFail, shouldPass, suite, test }          from "@surface/test-suite";
import { assert }                                                  from "chai";
import ArrowFunctionExpression                                     from "../internal/expressions/arrow-function-expression.js";
import Identifier                                                  from "../internal/expressions/identifier.js";
import Literal                                                     from "../internal/expressions/literal.js";
import Messages                                                    from "../internal/messages.js";
import NodeType                                                    from "../internal/node-type.js";
import Parser                                                      from "../internal/parser.js";
import ArrayPattern                                                from "../internal/patterns/array-pattern.js";
import AssignmentPattern                                           from "../internal/patterns/assignment-pattern.js";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { EvaluationErrorExpected, ExpressionFactoryExpected } from "./expression-expectations.js";
import { evaluationsExpected, expressionFactoriesExpected }        from "./expression-expectations.js";

@suite
export default class ExpressionSpec
{
    @shouldPass
    @batchTest(expressionFactoriesExpected, x => `method Expression.${x.method} should return ${NodeType[x.type]} Expression`)
    public expressionFactory(expressionFactoryExpected: ExpressionFactoryExpected): void
    {
        const expression = expressionFactoryExpected.factory();

        assert.equal(expression.type, expressionFactoryExpected.type);
        assert.equal(expression.toString(), expressionFactoryExpected.toString);

        const clone = expression.clone();

        if (expression.hasOwnProperty("toString"))
        {
            clone.clone    = expression.clone;
            clone.toString = expression.toString;
        }

        assert.deepEqual(expression, clone);
    }

    @test @shouldPass
    public parse(): void
    {
        const expression = Parser.parse("this");

        assert.equal(expression.type, NodeType.ThisExpression);
    }

    @shouldFail
    @batchTest(evaluationsExpected, x => `evaluate: ${x.raw}; should throw ${x.error.message}`)
    public evaluationsShouldThrow(evaluationErrorExpected: EvaluationErrorExpected): void
    {
        try
        {
            Parser.parse(evaluationErrorExpected.raw).evaluate(evaluationErrorExpected.scope);

            throw new Error(`Evaluate: ${evaluationErrorExpected.raw}; not throw`);
        }
        catch (error)
        {
            assert(error instanceof Error);

            assert.equal(error.message, evaluationErrorExpected.error.message);
        }
    }

    @test @shouldFail
    public arrowFunctionWithInvalidAssignmentPattern(): void
    {
        const parameters    = [new AssignmentPattern(new ArrayPattern([]), new Literal(1))];
        const body          = new Identifier("x");
        const arrowFunction = new ArrowFunctionExpression(parameters, body);

        assert.throws(arrowFunction.evaluate({ }) as () => void, Messages.illegalPropertyInDeclarationContext);
    }
}
