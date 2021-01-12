import type ITraceable from "./traceable";

export default interface IKeyValueTraceable extends ITraceable
{
    rawKeyExpression: string;
}