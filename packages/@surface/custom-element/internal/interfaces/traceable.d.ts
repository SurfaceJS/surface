import type { StackTrace } from "../types";

export default interface ITraceable
{
    rawExpression: string;
    stackTrace:    StackTrace;
}