import { Unknown }    from "@surface/core";
import ExpressionType from "../expression-type";

export default interface IExpression
{
    evaluate(): Unknown;
    type: ExpressionType;
}