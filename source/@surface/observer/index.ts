import { Action1 }              from "@surface/core";
import Type                     from "@surface/reflection";
import PropertyInfo             from "@surface/reflection/property-info";
import IObservable              from "./interfaces/observable";
import { NOTIFYING, OBSERVERS } from "./symbols";

export default class Observer
{
    private listeners: Array<Action1<unknown>> = [];

    public static inject<T extends IObservable, K extends keyof T>(target: T, key: K, observer: Observer): void;
    public static inject(target: IObservable, property: PropertyInfo, observer: Observer): void;
    public static inject(target: IObservable, keyOrproperty: string|PropertyInfo, observer: Observer): void
    {
        const property = keyOrproperty instanceof PropertyInfo ?
            keyOrproperty
            : Type.from(target).getProperty(keyOrproperty)!;

        if (!property.readonly)
        {
            Object.defineProperty
            (
                target,
                property.key,
                {
                    configurable: true,
                    get: property.getter && property.getter.bind(target),
                    set: function (this: typeof target, value: Object)
                    {
                        if (!this[NOTIFYING])
                        {
                            property.setter!.call(this, value);

                            this[NOTIFYING] = true;

                            observer.notify(value);

                            this[NOTIFYING] = false;
                        }
                    }
                }
            );
        }
        else
        {
            throw new Error(`Cannot bind readonly property ${property.key.toString()} on type ${target.constructor.name}`);
        }
    }

    public static notify<T extends IObservable, K extends keyof T>(target: T, key: K|symbol): void
    {
        type Key = keyof IObservable;

        const observer = Observer.observe(target, key as Key);

        target[NOTIFYING] = true;

        observer.notify(target[key as Key]);

        target[NOTIFYING] = false;
    }

    public static observe<T extends IObservable, K extends keyof T>(target: T, key: K|symbol): Observer;
    public static observe(target: IObservable, key: string|symbol): Observer
    {
        const observers = target[OBSERVERS] = target[OBSERVERS] || new Map<string|symbol, Observer>();

        if (!observers.has(key))
        {
            observers.set(key, new Observer());
        }

        return observers.get(key)!;
    }

    public notify(value?: unknown): void
    {
        this.listeners.forEach(listener => listener(value));
    }

    public subscribe(action: Action1<unknown>): void
    {
        this.listeners.push(action);
    }

    public unsubscribe(action: Action1<unknown>): void
    {
        this.listeners = this.listeners.filter(x => x != action);
    }
}