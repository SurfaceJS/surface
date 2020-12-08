import ExpressionVisitor from "../../internal/expression-visitor.js";
import type IExpression  from "../../internal/interfaces/expression.js";

export default class FixtureVisitor extends ExpressionVisitor
{
    private readonly visited: string[] = [];

    public visit(expression: IExpression): IExpression
    {
        this.visited.push(expression.constructor.name);

        super.visit(expression);

        return expression;
    }

    public toString(): string
    {
        return this.visited.join(" > ");
    }
}