import ExpressionVisitor from "../../internal/expression-visitor";
import IExpression       from "../../internal/interfaces/expression";

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