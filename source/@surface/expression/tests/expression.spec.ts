import { batchTest, shouldPass, suite }                        from "@surface/test-suite";
import { expect }                                              from "chai";
import NodeType                                                from "../node-type";
import { expressionFactoryFixtures, ExpressionFactoryFixture } from "./expectations/expression-expected";

@suite
export default class ExpressionSpec
{
    @shouldPass
    @batchTest(expressionFactoryFixtures, x => `method Expression.${NodeType[x.type]} should return ${NodeType[x.type]} Expression`)
    public expressionFactory(fixture: ExpressionFactoryFixture)
    {
        const expression = fixture.factory();
        expect(expression.type).to.equal(fixture.type);

        if ("evaluate" in expression)
        {
            const value = expression.evaluate(fixture.scope || { });

            if (value instanceof RegExp)
            {
                expect(value).to.match(fixture.value as RegExp);
            }
            else
            {
                expect(value).to.deep.equal(fixture.value);
            }
        }
    }
}