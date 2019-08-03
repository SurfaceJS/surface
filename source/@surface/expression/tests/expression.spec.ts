import { batchTest, shouldFail, shouldPass, suite, test }       from "@surface/test-suite";
import chai                                                     from "chai";
import Expression                                               from "..";
import Messages                                                 from "../internal/messages";
import NodeType                                                 from "../node-type";
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

    // @test @shouldFail
    // public arrowFunctionWithWithBindedIdentifier(): void
    // {
    //     const parameters    = [Expression.identifier("x")];
    //     const body          = Expression.identifier("x");
    //     const arrowFunction = Expression.arrowFunction(parameters, body);

    //     chai.expect(arrowFunction.evaluate({ })).to.throw(Messages.bindedIdentifierIsNotAllowedInThisContext);
    // }

    // @test @shouldFail
    // public arrowFunctionWithWithRestBindedIdentifier(): void
    // {
    //     const parameters    = [Expression.rest(Expression.identifier("x"))];
    //     const body          = Expression.identifier("x");
    //     const arrowFunction = Expression.arrowFunction(parameters, body);

    //     chai.expect(arrowFunction.evaluate({ })).to.throw(Messages.bindedIdentifierIsNotAllowedInThisContext);
    // }

    // @test @shouldFail
    // public arrowFunctionWithWithAssignmentPatternBindedIdentifier(): void
    // {
    //     const parameters    = [Expression.assignmentPattern(Expression.identifier("x", true), Expression.literal(1))];
    //     const body          = Expression.identifier("x", true);
    //     const arrowFunction = Expression.arrowFunction(parameters, body);

    //     chai.expect(arrowFunction.evaluate({ })).to.throw(Messages.bindedIdentifierIsNotAllowedInThisContext);
    // }

    // @test @shouldFail
    // public arrowFunctionWithWithObjectPatternBindedIdentifier(): void
    // {
    //     const properties    = [Expression.assignmentProperty(Expression.identifier("x", true), Expression.identifier("z"))];
    //     const parameters    = [Expression.objectPattern(properties)];
    //     const body          = Expression.identifier("z", true);
    //     const arrowFunction = Expression.arrowFunction(parameters, body);

    //     chai.expect(arrowFunction.evaluate({ })).to.throw(Messages.bindedIdentifierIsNotAllowedInThisContext);
    // }
}