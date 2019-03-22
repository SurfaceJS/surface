import { Indexer }      from "@surface/core";
import IListener        from "../interfaces/listener";
import IObserver        from "../interfaces/observer";
import ISubscription    from "../interfaces/subscription";
import PropertyListener from "./property-listener";

export default class Subscription implements ISubscription
{
    private readonly listeners: Set<IListener> = new Set();

    public constructor (private readonly observer: IObserver)
    { }

    public addListener(listener: IListener)
    {
        this.listeners.add(listener);
    }

    public unsubscribe()
    {
        for (const listener of this.listeners)
        {
            this.observer.unsubscribe(listener);
        }
    }

    public update(target: Indexer)
    {
        for (const observer of this.listeners.values())
        {
            if (observer instanceof PropertyListener)
            {
                observer.update(target);
            }
        }
    }

    public toString(): string
    {
        return `{ "listeners": [${Array.from(this.listeners).map(x => x.toString()).join(", ")}], "observer": ${this.observer.toString()} }`;
    }
}