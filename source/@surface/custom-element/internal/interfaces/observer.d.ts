import { Delegate }  from "@surface/core";
import ISubscription from "./subscription";

export default interface IObserver<T = unknown>
{
    size: number;
    notify(value: T): void;
    subscribe(listener: Delegate<[T]>): ISubscription;
    unsubscribe(listener: Delegate<[T]>): void;
}