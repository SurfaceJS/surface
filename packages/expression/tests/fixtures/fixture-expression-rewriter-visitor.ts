import ExpressionRewriterVisitor from "../../internal/expression-rewriter-visitor.js";
import type IExpression          from "../../internal/interfaces/expression.js";

export default class FixtureExpressionRewriterVisitor extends ExpressionRewriterVisitor
{
    private readonly visited: string[] = [];

    public override visit(expression: IExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visit(expression);

        return expression;
    }

    public override toString(): string
    {
        return this.visited.join(" > ");
    }
}
