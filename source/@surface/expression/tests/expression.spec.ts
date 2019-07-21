import { batchTest, shouldFail, shouldPass, suite, test }      from "@surface/test-suite";
import chai                                                    from "chai";
import Expression                                              from "..";
import NodeType                                                from "../node-type";
import { expressionFactoryFixtures, ExpressionFactoryExpected } from "./expectations/expression-expected";

@suite
export default class ExpressionSpec
{
    @shouldPass
    @batchTest(expressionFactoryFixtures, x => `method Expression.${x.method} should return ${NodeType[x.type]} Expression`)
    public expressionFactory(expected: ExpressionFactoryExpected)
    {
        chai.expect(expected.factory().type).to.equal(expected.type);
    }

    @test @shouldPass
    public parse()
    {
        const expression = Expression.parse("this");

        chai.expect(expression.type).to.equal(NodeType.ThisExpression);
    }

    @test @shouldFail
    public arrowFunctionWithDuplicatedParameters()
    {
        const expression = () =>
            Expression.arrowFunction([Expression.identifier("a"), Expression.identifier("a") ], Expression.identifier("x", true));

        chai.expect(expression).to.throw("Duplicate parameter name not allowed in this context");
    }
}