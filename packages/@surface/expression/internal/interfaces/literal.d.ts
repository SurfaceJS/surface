import type { LiteralValue } from "../types/operators";
import type IExpression      from "./expression";

export default interface ILiteral extends IExpression
{
    value: LiteralValue;
}