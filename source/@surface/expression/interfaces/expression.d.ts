import ExpressionType from "../expression-type";

import { Unknown } from "@surface/types";

export default interface IExpression
{
    evaluate(): Unknown;
    type: ExpressionType;
}