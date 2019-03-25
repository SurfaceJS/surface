import ExpressionType from "../expression-type";

export default interface IExpression
{
    type: ExpressionType;
    evaluate(): unknown;
}