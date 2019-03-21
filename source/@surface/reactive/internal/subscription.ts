import { Indexer }      from "@surface/core";
import IListener        from "../interfaces/listener";
import PropertyListener from "./property-listener";
import Reactor          from "./reactor";

export default class Subscription
{
    private readonly _listeners: Map<string, PropertyListener> = new Map();

    public get listeners(): Map<string, IListener>
    {
        return this._listeners;
    }

    public constructor (private readonly reactor: Reactor)
    { }

    public unsubscribe()
    {
        for (const [key, observer] of this.listeners)
        {
            this.reactor.observers.get(key)!.unsubscribe(observer);
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
        return `{ "reactor": ${this.reactor}, "observers": { ${Array.from(this.listeners).map(([key, observer]) => `"${key}": ${observer.toString()}`).join(",")} } }`;
    }
}