import { StackTrace } from "../StackTrace";

export default interface ITraceable
{
    rawExpression: string;
    stackTrace:    StackTrace;
}