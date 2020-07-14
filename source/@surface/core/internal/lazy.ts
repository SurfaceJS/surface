export default class Lazy<T>
{
    private cache:   T | undefined;
    private factory: () => T;

    public get value(): T
    {
        if (!this.cache)
        {
            this.cache = this.factory();
        }

        return this.cache;
    }

    public constructor(factory: () => T)
    {
        this.factory = factory;
    }

    public reset(): void
    {
        this.cache = undefined;
    }
}