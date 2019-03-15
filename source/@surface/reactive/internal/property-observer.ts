import { Indexer } from "@surface/core";

export default class PropertyObserver<TTarget extends Indexer = Indexer, TKey extends keyof TTarget = string>
{
    public constructor(private target: TTarget, private readonly key: TKey)
    { }

    public update(target: TTarget)
    {
        this.target = target;
    }

    public notify(value: TTarget[TKey]): void
    {
        this.target[this.key] = value;
    }
}