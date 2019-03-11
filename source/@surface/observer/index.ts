import { Action1, Func, Indexer } from "@surface/core";
import Type                       from "@surface/reflection";
import FieldInfo                  from "@surface/reflection/field-info";
import MemberInfo                 from "@surface/reflection/member-info";
import MethodInfo                 from "@surface/reflection/method-info";
import PropertyInfo               from "@surface/reflection/property-info";

export const OBSERVERS     = Symbol("observer:observers");
export const OBSERVED_PATH = Symbol("observer:observed-path");

type Observable = Indexer &
{
    [OBSERVERS]?:     Map<string|symbol, Observer>
    [OBSERVED_PATH]?: boolean
};
type ObservedKey = keyof Observable;

export default class Observer
{
    private readonly listeners: Array<Action1<unknown>> = [];

    private static inject(target: Observable, member: MemberInfo): void
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
                        get: member.getter as Func<unknown>|undefined,
                        set(this: Observable, value: unknown)
                        {
                            let previous: unknown;

                            if (!member.getter || !Object.is(previous = member.getter.call(this), value))
                            {
                                if (Observer.isObserved(previous))
                                {
                                    Observer.migrate(previous, value);
                                }

                                member.setter!.call(this, value);

                                const observer = this[OBSERVERS]!.get(member.key);

                                if (observer)
                                {
                                    observer.notify(value);
                                }
                            }
                        }
                    }
                );
            }
            else if (`_${member.key.toString()}` in target)
            {
                const privateKey = `__${member.key.toString()}__` as ObservedKey;
                target[privateKey] = target[member.key as ObservedKey];

                Object.defineProperty
                (
                    target,
                    `_${member.key.toString()}`,
                    {
                        get(this: Observable)
                        {
                            return this[privateKey];
                        },
                        set(this: Observable, value: unknown)
                        {
                            let previous: unknown;

                            if (!Object.is(value, previous = this[privateKey]))
                            {

                                if (Observer.isObserved(previous))
                                {
                                   Observer.migrate(previous, value);
                                }

                                this[privateKey] = value;

                                const observer = this[OBSERVERS]!.get(member.key);

                                if (observer)
                                {
                                    observer.notify(value);
                                }
                            }
                        }
                    }
                );
            }
        }
        else if (member instanceof FieldInfo)
        {
            const privateKey = typeof member.key == "symbol" ?
                Symbol(`_${member.key.toString()}`) as ObservedKey
                : `_${member.key.toString()}` as ObservedKey;

            target[privateKey] = member.value;

            Object.defineProperty
            (
                target,
                member.key,
                {
                    get(this: Observable)
                    {
                        return this[privateKey];
                    },
                    set(this: Observable, value: unknown)
                    {
                        let previous: unknown;

                        if (!Object.is(value, previous = this[privateKey]))
                        {
                            if (Observer.isObserved(previous))
                            {
                                Observer.migrate(previous, value);
                            }

                            this[privateKey] = value;

                            const observer = this[OBSERVERS]!.get(member.key);

                            if (observer)
                            {
                                observer.notify(value);
                            }
                        }
                    }
                }
            );
        }
        else if (member instanceof MethodInfo)
        {
            target[member.key as ObservedKey] = function(...args: Array<unknown>)
            {
                const observer = this[OBSERVERS]!.get(member.key);

                if (observer)
                {
                    observer.notify(member.invoke.call(target, args));
                }
            };
        }
    }

    private static isObserved(target: unknown): boolean;
    private static isObserved(target: Observable): boolean;
    private static isObserved(target: Observable): boolean
    {
        return !!target[OBSERVED_PATH] || !!target[OBSERVERS];
    }

    private static migrate(source: unknown, target: unknown): void;
    private static migrate(source: Observable, target: Observable): void;
    private static migrate(source: Observable, target: Observable): void
    {
        for (const [observedKey, sourceObserver] of source[OBSERVERS]!.entries())
        {
            if (Observer.isObserved(source[observedKey as ObservedKey]))
            {
                Observer.migrate(source[observedKey as ObservedKey], target[observedKey as ObservedKey]);
            }

            const observers = target[OBSERVERS] = target[OBSERVERS] || new Map<string, Observer>();

            if (observers.has(observedKey))
            {
                observers.get(observedKey)!.subscribe(...sourceObserver.listeners);
            }
            else
            {
                const observer = Observer
                    .observe(target, observedKey as ObservedKey)
                    .subscribe(...sourceObserver.listeners)
                    .notify(target[observedKey as ObservedKey]);

                observers.set(observedKey, observer);
            }

            sourceObserver.clear();
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
        const observers = target[OBSERVERS] = (target[OBSERVERS] || new Map<string|symbol, Observer>());

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

            Observer.inject(target, member);

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

    public subscribe(...actions: Array<Action1<unknown>>): Observer
    {
        for (const action of actions)
        {
            if (!this.listeners.includes(action))
            {
                this.listeners.push(action);
            }
        }

        return this;
    }

    public unsubscribe(...actions: Array<Action1<unknown>>): Observer
    {
        for (const action of actions)
        {
            const index = this.listeners.indexOf(action);

            if (index > -1)
            {
                this.listeners.splice(this.listeners.indexOf(action), 1);
            }
            else
            {
                throw new Error("Action not subscribed");
            }
        }

        return this;
    }
}