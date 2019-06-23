import ExpressionType from "../expression-type";

export default interface IExpression
{
    type:       ExpressionType;
    cache:      unknown;
    evaluate(): unknown;
    toString(): string;
}