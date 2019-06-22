import ExpressionVisitor from "../../expression-visitor";
import IExpression       from "../../interfaces/expression";

export default class FixtureVisitor extends ExpressionVisitor
{
    private readonly visited: Array<string> = [];

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