import { Action1 }       from "@surface/core";
import IListener         from "./listener";
import IPropertyListener from "./notifier";
import ISubscription     from "./subscription";

export default interface IObserver<T = unknown>
{
    notify(value: T): void;
    subscribe(listener: IListener<T>): ISubscription;
    unsubscribe(listener: IListener<T>): void;
}