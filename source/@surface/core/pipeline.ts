export default class Pipeline<TValue>
{
    private constructor(private readonly _value: TValue)
    { }

    public static from<T>(value: T): Pipeline<T>
    {
        return new Pipeline(value);
    }

    public pipe<TResult>(action: (value: TValue) => TResult): Pipeline<TResult>
    {
        return new Pipeline(action(this._value));
    }

    public value(): TValue
    {
        return this._value;
    }
}