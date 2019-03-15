import { Indexer }      from "@surface/core";
import PropertyObserver from "./property-observer";
import Reactor          from "./reactor";
import { SUBSCRIBER }   from "./symbols";

export class Subscription
{
    private readonly _observers: Map<string, PropertyObserver> = new Map();

    public get observers(): Map<string, PropertyObserver>
    {
        return this._observers;
    }

    public constructor (private readonly reactor: Reactor)
    { }

    public unsubscribe()
    {
        for (const [key, observer] of this.observers)
        {
            this.reactor.subjects.get(key)!.unsubscribe(observer);
        }
    }

    public update(target: Indexer)
    {
        for (const observer of this.observers.values())
        {
            observer.update(target);
        }
    }
}

export default class Subscriber
{
    private readonly _subscriptions: Map<Indexer, Subscription> = new Map();

    public get subscriptions(): Map<Indexer, Subscription>
    {
        return this._subscriptions;
    }

    public constructor(private readonly target: Indexer & { [SUBSCRIBER]?: Subscriber })
    {
        this.target[SUBSCRIBER] = this;
    }

    public update(target: Indexer)
    {
        for (const subscription of this.subscriptions.values())
        {
            subscription.update(target);
        }
    }
}