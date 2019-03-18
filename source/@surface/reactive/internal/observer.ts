import IListener   from "../interfaces/listener";
import IObserver   from "../interfaces/observer";

export default class Observer<TValue = unknown> implements IObserver<TValue>
{
    private readonly listeners: Set<IListener> = new Set();

    public subscribe(listerner: IListener)
    {
        this.listeners.add(listerner);
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