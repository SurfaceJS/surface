export default class AggregateError extends Error
{
    public constructor(public readonly errors: Error[])
    {
        super("One or more errors occurred.");
    }
}