import ExpressionType from "../expression-type";

export default interface IExpression
{
    evaluate(): unknown;
    type: ExpressionType;
}