import IExpression       from "../../interfaces/expression";
import ExpressionVisitor from "../../expression-visitor";

export default class FixtureVisitor extends ExpressionVisitor
{
    public visit(expression: IExpression): IExpression
    {
        const visited = super.visit(expression);
        return { type: -1, evaluate: () => (visited as Object).constructor.name };
    }
}