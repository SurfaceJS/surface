import ExpressionType from "../expression-type";

import { Nullable } from "@surface/types";

export default interface IExpression
{
    evaluate(): Nullable<Object>;
    type: ExpressionType;
}