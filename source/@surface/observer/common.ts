import Type                     from "@surface/reflection";
import PropertyInfo             from "@surface/reflection/property-info";
import Observer                 from ".";
import IObservable              from "./interfaces/observable";
import { NOTIFYING, OBSERVERS } from "./symbols";

export function listen<T extends IObservable, K extends keyof T>(target: T, key: K, observer: Observer): void;
export function listen(target: IObservable, property: PropertyInfo, observer: Observer): void;
export function listen(target: IObservable, keyOrproperty: string|PropertyInfo, observer: Observer): void
{
    const property = keyOrproperty instanceof PropertyInfo ? keyOrproperty : Type.from(target).getProperty(keyOrproperty)!;

    Object.defineProperty
    (
        target,
        property.key,
        {
            configurable: true,
            get: function (this: typeof target)
            {
                return property.getter && property.getter.call(this);
            },
            set: function (this: typeof target, value: Object)
            {
                if (!this[NOTIFYING] && property.setter)
                {
                    property.setter.call(this, value);

                    this[NOTIFYING] = true;

                    observer.notify();

                    this[NOTIFYING] = false;
                }
            }
        }
    );
}

export function notify<T extends IObservable, K extends keyof T>(target: T, key: K|symbol): void
{
    const observer = observe(target, key as keyof IObservable);

    target[NOTIFYING] = true;

    observer.notify();

    target[NOTIFYING] = false;
}

export function observe<T extends IObservable, K extends keyof T>(target: T, key: K|symbol): Observer;
export function observe(target: IObservable, key: string|symbol): Observer
{
    const observers = target[OBSERVERS] = target[OBSERVERS] || new Map<string|symbol, Observer>();

    if (!observers.has(key))
    {
        observers.set(key, new Observer());
    }

    return observers.get(key)!;
}