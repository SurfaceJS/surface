import { batchTest, shouldPass, suite }                        from "@surface/test-suite";
import { expect }                                              from "chai";
import ExpressionType                                          from "../expression-type";
import { expressionFactoryFixtures, ExpressionFactoryFixture } from "./fixtures/expression-factory";

@suite
export default class ExpressionSpec
{
    @shouldPass
    @batchTest(expressionFactoryFixtures, x => `method Expression.${ExpressionType[x.type].toLowerCase()} should return ${ExpressionType[x.type]} Expression`)
    public expressionFactory(fixture: ExpressionFactoryFixture)
    {
        const expression = fixture.factory();
        expect(expression.type).to.equal(fixture.type);

        const value = expression.evaluate();

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