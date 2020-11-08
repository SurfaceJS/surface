import { Delegate } from "@surface/core";
import IObserver     from "./interfaces/observer";
import ISubscription from "./interfaces/subscription";

export default class Observer<TValue = unknown> implements IObserver<TValue>
{
    private readonly listeners: Set<Delegate<[TValue]>> = new Set();

    public get size(): number
    {
        return this.listeners.size;
    }

    public subscribe(listerner: Delegate<[TValue]>): ISubscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: Delegate<[TValue]>): void
    {
        if (!this.listeners.delete(listerner))
        {
            throw new Error("Listerner not subscribed");
        }
    }

    public notify(value: TValue): void
    {
        for (const listerner of this.listeners)
        {
            listerner(value);
        }
    }
}