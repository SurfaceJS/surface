export default interface IGetSetupSync<TResult = unknown>
{
    returns(value: TResult): void;
    throws(error: unknown): void;
}
