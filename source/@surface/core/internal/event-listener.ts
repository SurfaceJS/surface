import { Action }     from "./types";
import ISubscription  from "./interfaces/subscription";
import IEventListener from "./interfaces/event-listener";

export default class EventListener<TValue = unknown> implements IEventListener<TValue>
{
    private readonly listeners: Set<Action<[TValue]>> = new Set();

    public subscribe(listerner: Action<[TValue]>): ISubscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: Action<[TValue]>)
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