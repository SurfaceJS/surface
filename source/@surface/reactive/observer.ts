import IListener     from "./interfaces/listener";
import IObserver     from "./interfaces/observer";
import ISubscription from "./interfaces/subscription";

export default class Observer<TValue = unknown> implements IObserver<TValue>
{
    private readonly listeners: Set<IListener> = new Set();

    public subscribe(listerner: IListener): ISubscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: IListener)
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
            listerner.notify(value);
        }
    }

    public toString(): string
    {
        return `[${Array.from(this.listeners).map(x => x.toString()).join(", ")}]`;
    }
}