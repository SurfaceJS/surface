import { Indexer }           from "@surface/core";
import IObserver             from "./interfaces/observer";
import IPropertyListener     from "./interfaces/property-listener";
import IPropertySubscription from "./interfaces/property-subscription";

export default class PropertySubscription implements IPropertySubscription
{
    public constructor (private readonly listener: IPropertyListener, private readonly observer: IObserver)
    { }

    public unsubscribe()
    {
        this.observer.unsubscribe(this.listener);
    }

    public update(target: Indexer)
    {
        this.listener.update(target);
    }

    public toString(): string
    {
        return `{ "listener": ${this.listener.toString()}, "observer": ${this.observer.toString()} }`;
    }
}