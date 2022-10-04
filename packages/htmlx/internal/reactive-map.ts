import { type Delegate, Event, type Subscription } from "@surface/core";

export default class ReactiveMap<K, V> extends Map<K, V>
{
    protected readonly listeners: Set<Delegate<[this]>> = new Set();

    public readonly cleared: Event                     = new Event();
    public readonly deleted: Event<K>                  = new Event();
    public readonly setted:  Event<[key: K, value: V]> = new Event();

    private notify(): void
    {
        this.listeners.forEach(listener => listener(this));
    }

    public override clear(): void
    {
        super.clear();

        this.cleared.notify();

        this.notify();
    }

    public override delete(key: K): boolean
    {
        const deleted = super.delete(key);

        this.deleted.notify(key);

        this.notify();

        return deleted;
    }

    public override set(key: K, value: V): this
    {
        super.set(key, value);

        this.setted.notify([key, value]);

        this.notify();

        return this;
    }

    public subscribe(listener: Delegate<[this]>): Subscription
    {
        this.listeners.add(listener);

        return { unsubscribe: () => this.unsubscribe(listener) };
    }

    public unsubscribe(listener: Delegate<[this]>): void
    {
        if (!this.listeners.delete(listener))
        {
            throw new Error("Listener not subscribed");
        }
    }
}
