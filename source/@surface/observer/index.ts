import { Action, Action1 }      from "@surface/core";
import Type                     from "@surface/reflection";
import FieldInfo                from "@surface/reflection/field-info";
import PropertyInfo             from "@surface/reflection/property-info";
import IObservable              from "./interfaces/observable";
import { NOTIFYING, OBSERVERS } from "./symbols";

export default class Observer
{
    private listeners: Array<Action1<unknown>> = [];

    public static inject<T extends IObservable, K extends keyof T>(target: T, key: K, observer: Observer): boolean;
    public static inject(target: IObservable, field:      FieldInfo,        observer: Observer): boolean;
    public static inject(target: IObservable, keyOrField: string|FieldInfo, observer: Observer): boolean
    {
        type Key   = keyof IObservable;
        type Value = IObservable[Key];

        const member = keyOrField instanceof FieldInfo ?
            keyOrField
            : Type.from(target).getMember(keyOrField)!;

        if (member instanceof PropertyInfo)
        {
            if (!member.readonly)
            {
                Object.defineProperty
                (
                    target,
                    member.key,
                    {
                        get: member.getter as Action|undefined,
                        set: function (this: typeof target, value: Object)
                        {
                            if (!this[NOTIFYING])
                            {
                                member.setter!.call(this, value);

                                this[NOTIFYING] = true;

                                observer.notify(value);

                                this[NOTIFYING] = false;
                            }
                        }
                    }
                );
            }
            else if (`_${member.key.toString()}` in target)
            {
                const privateKey = `__${member.key.toString()}__` as Key;
                target[privateKey] = target[member.key as Key];

                Object.defineProperty
                (
                    target,
                    `_${member.key.toString()}`,
                    {
                        get: function(this: IObservable)
                        {
                            return this[privateKey];
                        },
                        set: function (this: IObservable, value: Value)
                        {
                            if (!this[NOTIFYING])
                            {
                                this[privateKey] = value;

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
                return false;
            }
        }
        else if (member instanceof FieldInfo)
        {
            const privateKey = typeof member.key == "symbol" ?
                Symbol(`_${member.key.toString()}`) as Key
                : `_${member.key.toString()}` as Key;

            target[privateKey] = member.value as Value;
            Object.defineProperty
            (
                target,
                member.key,
                {
                    get: function(this: IObservable)
                    {
                        return this[privateKey];
                    },
                    set: function (this: IObservable, value: Value)
                    {
                        if (!this[NOTIFYING])
                        {
                            this[privateKey] = value;

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
            return false;
        }

        return true;
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