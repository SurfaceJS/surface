import { Nullable } from "@surface/types";

export default interface IExpression
{
    evaluate(): Nullable<Object>;
}