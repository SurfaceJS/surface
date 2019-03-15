import { Action1 } from "@surface/core";

export default class Observer<TValue = unknown>
{
    private readonly listeners: Set<Action1<TValue>> = new Set();

    public subscribe(listerner: Action1<TValue>)
    {
        this.listeners.add(listerner);
    }

    public unsubscribe(listerner: Action1<TValue>)
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