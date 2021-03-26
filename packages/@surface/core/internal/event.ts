import type { Delegate } from "./types/index";
import type Subscription from "./types/subscription";

export default class Event<TArgs = unknown>
{
    private readonly listeners: Set<Delegate<[TArgs]>> = new Set();

    public subscribe(listerner: Delegate<[TArgs]>): Subscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: Delegate<[TArgs]>): void
    {
        if (!this.listeners.delete(listerner))
        {
            throw new Error("Listerner not subscribed");
        }
    }

    public notify(value: TArgs): void
    {
        for (const listerner of this.listeners)
        {
            listerner(value);
        }
    }
}