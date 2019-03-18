import { Action1 }       from "@surface/core";
import IListener         from "./listener";
import IPropertyListener from "./notifier";

export default interface IObserver<T = unknown>
{
    notify(value: unknown): void;
    subscribe(listener: IListener): void;
    unsubscribe(listener: IListener): void;
}