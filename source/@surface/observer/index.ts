import { Action, Action1 } from "@surface/core";
import Type                from "@surface/reflection";
import FieldInfo           from "@surface/reflection/field-info";
import MemberInfo          from "@surface/reflection/member-info";
import MethodInfo          from "@surface/reflection/method-info";
import PropertyInfo        from "@surface/reflection/property-info";

export const OBSERVERS = Symbol("observer:observers");

type Observable = Object & { [OBSERVERS]?: Map<string|symbol, Observer> };
type Key        = keyof Observable;
type Value      = Observable[Key];

export default class Observer
{
    private readonly listeners: Array<Action1<unknown>> = [];

    private static inject(target: Observable, member: MemberInfo, observer: Observer): void
    {
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
        else if (member instanceof MethodInfo)
        {
            target[member.key as Key] = function(...args: Array<unknown>)
            {
                observer.notify(member.invoke.call(target, args));
            };
        }
    }

    public static notify<T extends Observable, K extends keyof T>(target: T, key: K): void
    {
        Observer.observe(target, key).notify(target[key]);
    }

    public static observe<T extends Observable, K extends keyof T>(target: T, key: K): Observer;
    public static observe(target: Observable, member: MemberInfo): Observer;
    public static observe(target: Observable, keyOrMember: string|MemberInfo): Observer
    {
        const observers = target[OBSERVERS] = target[OBSERVERS] || new Map();

        const [key, getMember] = typeof keyOrMember == "string" ?
            [keyOrMember, () => Type.from(target).getMember(keyOrMember)]
            : [keyOrMember.key, () => keyOrMember];

        if (!observers.has(key))
        {
            const member = getMember();

            if (!member)
            {
                throw new Error(`Member ${key.toString()} does not exists on type ${target.constructor.name}`);
            }

            const observer = new Observer();

            Observer.inject(target, member, observer);

            observers.set(key, observer);
        }

        return observers.get(key)!;
    }

    public clear(): Observer
    {
        this.listeners.splice(0, this.listeners.length);
        return this;
    }

    public notify(value?: unknown): Observer
    {
        this.listeners.forEach(listener => listener(value));
        return this;
    }

    public subscribe(action: Action1<unknown>): Observer
    {
        this.listeners.push(action);
        return this;
    }

    public unsubscribe(action: Action1<unknown>): Observer
    {
        this.listeners.splice(this.listeners.indexOf(action), 1);
        return this;
    }
}