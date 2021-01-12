
export default interface IGetSetup<TResult = unknown>
{
    returns(value: TResult): void;
    throws(error: Error | string): void;
}
