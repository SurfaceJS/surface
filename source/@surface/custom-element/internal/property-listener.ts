import { Indexer }       from "@surface/core";
import IPropertyListener from "@surface/reactive/interfaces/property-listener";

export default class PropertyListener<TTarget extends Indexer = Indexer, TKey extends keyof TTarget = string> implements IPropertyListener<TTarget[TKey]>
{
    public constructor(private target: TTarget, private readonly key: TKey)
    { }

    public update(target: TTarget)
    {
        if (this.target != target)
        {
            this.target = target;
        }
    }

    public notify(value: TTarget[TKey]): void
    {
        this.target[this.key] = value;
    }

    public toString(): string
    {
        return `{ "${this.key}": ${JSON.stringify(this.target)} }`;
    }
}