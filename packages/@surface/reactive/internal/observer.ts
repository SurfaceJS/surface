import type { Delegate, Subscription } from "@surface/core";
import { getValue }                    from "@surface/core";

export default class Observer<TValue = unknown>
{
    protected readonly path:      string[];
    protected readonly root:      object;
    protected readonly listeners: Set<Delegate<[TValue]>> = new Set();

    public constructor(root: object, path: string[])
    {
        this.root = root;
        this.path = path;
    }

    public subscribe(listerner: Delegate<[TValue]>): Subscription
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

    public notify(): void
    {
        if (this.listeners.size > 0)
        {
            const value = getValue(this.root, ...this.path) as TValue;

            for (const listerner of this.listeners)
            {
                listerner(value);
            }
        }
    }
}