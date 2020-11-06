import IEventListener from "./interfaces/event-listener";
import ISubscription  from "./interfaces/subscription";
import { Delegate }   from "./types";

export default class EventListener<TValue = unknown> implements IEventListener<TValue>
{
    private readonly listeners: Set<Delegate<[TValue]>> = new Set();
    private disposed = false;

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.disposed = true;

            this.listeners.clear();
        }
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