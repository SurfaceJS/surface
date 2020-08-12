import IEventListener from "./interfaces/event-listener";
import ISubscription  from "./interfaces/subscription";
import { Action }     from "./types";

export default class EventListener<TValue = unknown> implements IEventListener<TValue>
{
    private readonly listeners: Set<Action<[TValue]>> = new Set();

    public subscribe(listerner: Action<[TValue]>): ISubscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: Action<[TValue]>): void
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