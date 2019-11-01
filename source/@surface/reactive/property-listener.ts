import { Indexer }       from "@surface/core";
import IPropertyListener from "./interfaces/property-listener";

export default class PropertyListener<TTarget extends Indexer = Indexer, TKey extends keyof TTarget = string> implements IPropertyListener<TTarget[TKey]>
{
    public constructor(private target: TTarget, private readonly key: TKey)
    { }

    public notify(value: TTarget[TKey]): void
    {
        this.target[this.key] = value;
    }

    public update(target: TTarget)
    {
        if (this.target != target)
        {
            this.target = target;
        }
    }
}