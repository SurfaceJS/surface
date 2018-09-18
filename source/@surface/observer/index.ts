import { Action, Action1 } from "@surface/core";
import Type                from "@surface/reflection";
import FieldInfo           from "@surface/reflection/field-info";
import PropertyInfo        from "@surface/reflection/property-info";

export const OBSERVERS = Symbol("observer:observers");

type Observable = Object & { [OBSERVERS]?: Map<keyof Observable, Observer> };
type Key        = keyof Observable;
type Value      = Observable[Key];

export default class Observer
{
    private readonly listeners: Array<Action1<unknown>> = [];

    public static inject<T extends Observable, K extends keyof T>(target: T, key: K, observer: Observer): boolean;
    public static inject(target: Observable, field:      FieldInfo,        observer: Observer): boolean;
    public static inject(target: Observable, keyOrField: string|FieldInfo, observer: Observer): boolean
    {
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
                            if (!member.getter || !Object.is(member.getter.call(this), value))
                            {
                                member.setter!.call(this, value);

                                observer.notify(value);
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
                        get: function(this: Observable)
                        {
                            return this[privateKey];
                        },
                        set: function (this: Observable, value: Value)
                        {
                            if (!Object.is(value, this[privateKey]))
                            {
                                this[privateKey] = value;

                                observer.notify(value);
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
                    get: function(this: Observable)
                    {
                        return this[privateKey];
                    },
                    set: function (this: Observable, value: Value)
                    {
                        if (!Object.is(value, this[privateKey]))
                        {
                            this[privateKey] = value;

                            observer.notify(value);
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

    public static notify<T extends Observable, K extends keyof T>(target: T, key: K): void
    {
        Observer.observe(target, key).notify(target[key]);
    }

    public static observe<T extends Observable, K extends keyof T>(target: T, key: K): Observer;
    public static observe(target: Observable, key: Key): Observer
    {
        const observers = target[OBSERVERS] = target[OBSERVERS] || new Map();

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
        this.listeners.splice(this.listeners.findIndex(x => x == action), 1);
    }
}