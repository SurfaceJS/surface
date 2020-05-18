import { Action, Indexer }   from "@surface/core";
import IObserver             from "./interfaces/observer";
import IPropertyListener     from "./interfaces/property-listener";
import IPropertySubscription from "./interfaces/property-subscription";

export default class PropertySubscription<TValue = unknown, TTarget extends Indexer = Indexer> implements IPropertySubscription<TTarget>
{
    private actions: Array<Action> = [];

    public constructor (private readonly listener: IPropertyListener<TValue, TTarget>, private readonly observer: IObserver<TValue>)
    { }

    public onUnsubscribe(action: Action): void
    {
        this.actions.push(action);
    }

    public unsubscribe(): void
    {
        this.observer.unsubscribe(this.listener);

        for (const action of this.actions.splice(0))
        {
            action();
        }
    }

    public update(target: TTarget): void
    {
        this.listener.update(target);
    }
}