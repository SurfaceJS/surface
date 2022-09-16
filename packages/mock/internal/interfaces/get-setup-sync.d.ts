export default interface IGetSetupSync<TResult = unknown>
{

    /** Configures value returned when property is accessed. */
    returns(value: TResult): void;

    /** Configures throws fired when property is accessed. */
    throws(error: unknown): void;
}
