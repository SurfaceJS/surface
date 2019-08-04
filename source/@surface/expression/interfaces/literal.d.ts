import { LiteralValue } from "../types";
import IExpression      from "./expression";

export default interface ILiteral extends IExpression
{
    value: LiteralValue;
}