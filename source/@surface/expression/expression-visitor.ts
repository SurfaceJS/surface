import IExpression from "./interfaces/expression";

export default abstract class ExpressionVisitor
{
    public visit(expression: IExpression): IExpression
    {
        return expression;
    }
}