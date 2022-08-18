import type { Delegate } from "./types/index";
import type Subscription from "./types/subscription";

export default class Event<TArgs = unknown>
{
    private readonly listeners: Set<Delegate<[TArgs]>> = new Set();

    public subscribe(listener: Delegate<[TArgs]>): Subscription
    {
        this.listeners.add(listener);

        return { unsubscribe: () => this.unsubscribe(listener) };
    }

    public unsubscribe(listener: Delegate<[TArgs]>): void
    {
        if (!this.listeners.delete(listener))
        {
            throw new Error("Listener not subscribed");
        }
    }

    public notify(value: TArgs): void
    {
        for (const listener of this.listeners)
        {
            listener(value);
        }
    }
}
