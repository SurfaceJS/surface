import IListener     from "./interfaces/listener";
import IObserver     from "./interfaces/observer";
import ISubscription from "./interfaces/subscription";

export default class Observer<TValue = unknown> implements IObserver<TValue>
{
    private readonly listeners: Set<IListener<TValue>> = new Set();

    public subscribe(listerner: IListener<TValue>): ISubscription
    {
        this.listeners.add(listerner);

        return { unsubscribe: () => this.unsubscribe(listerner) };
    }

    public unsubscribe(listerner: IListener<TValue>)
    {
        if (!this.listeners.delete(listerner))
        {
            throw new Error("listerner not subscribed");
        }
    }

    public notify(value: TValue): void
    {
        for (const listerner of this.listeners)
        {
            listerner.notify(value);
        }
    }
}