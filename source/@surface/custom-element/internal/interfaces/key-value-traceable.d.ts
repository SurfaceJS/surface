import ITraceable from "./traceable";

export default interface IKeyValueTraceable extends ITraceable
{
    rawKeyExpression: string;
}