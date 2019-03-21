import { Indexer }      from "@surface/core";
import IListener        from "../interfaces/listener";
import IObserver        from "../interfaces/observer";
import PropertyListener from "./property-listener";

export default class Subscription
{
    private readonly _listeners: Set<IListener> = new Set();

    public get listeners(): Set<IListener>
    {
        return this._listeners;
    }

    public constructor (private readonly observer: IObserver)
    { }

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