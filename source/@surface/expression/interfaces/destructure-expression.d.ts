import ExpressionType from "../expression-type";
import IExpression from "./expression";

export default interface IDestructureExpression extends IExpression
{
    destruct(value: unknown): unknown;
}