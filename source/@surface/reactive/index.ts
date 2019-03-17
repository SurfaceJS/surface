import { Action1, Indexer }          from "@surface/core";
import { typeGuard }                 from "@surface/core/common/generic";
import Type                          from "@surface/reflection";
import FieldInfo                     from "@surface/reflection/field-info";
import Observer                      from "./internal/observer";
import PropertyObserver              from "./internal/property-observer";
import PropertySubject               from "./internal/property-subject";
import Reactor                       from "./internal/reactor";
import Subscriber, { Subscription }  from "./internal/subscriber";
import { KEYS, REACTOR, SUBSCRIBER } from "./internal/symbols";

type Reactiveable<T extends Indexer = Indexer> = T &
{
    [KEYS]?:       Array<string>;
    [REACTOR]?:    Reactor;
    [SUBSCRIBER]?: Subscriber;
};

export default class Reactive
{
    private static reactivate(target: Reactiveable, reactor: Reactor)
    {
        const keys = new Set([...reactor.observers.keys(), ...reactor.subjects.keys(), ...reactor.dependencies.keys()]);

        for (const key of keys)
        {
            const value = target[key];

            Reactive.makeReactive(target, key);

            if (value instanceof Object && reactor.dependencies.has(key))
            {
                Reactive.reactivate(value, reactor.dependencies.get(key)!);
            }
        }
    }

    public static makeReactive<TTarget extends Indexer, TKey extends keyof TTarget>(target: Reactiveable<TTarget>, key: TKey): void
    {
        const keys   = target[KEYS] || [] as Array<string>;
        target[KEYS] = keys;

        if (keys.includes(key as string))
        {
            return;
        }

        keys.push(key as string);

        const member = Type.from(target).getMember(key as string);

        if (member instanceof FieldInfo)
        {
            const privateKey = `_${key}` as TKey;

            target[privateKey] = target[key];

            Object.defineProperty
            (
                target,
                key,
                {
                    get(this: TTarget)
                    {
                        return this[privateKey];
                    },
                    set(this: Reactiveable<TTarget>, value: TTarget[TKey])
                    {
                        const reactor  = this[REACTOR]!;
                        const oldValue = this[privateKey];

                        if (!Object.is(oldValue, value))
                        {
                            this[privateKey] = value;

                            const dependency = reactor.dependencies.get(key as string);

                            if (dependency)
                            {
                                dependency.unregister();

                                if (typeGuard<unknown, Reactiveable>(value, x => x instanceof Object))
                                {
                                    if (!value[REACTOR])
                                    {
                                        value[REACTOR] = new Reactor();
                                    }

                                    Reactive.reactivate(value, dependency as unknown as Reactor);

                                    dependency.register(value, value[REACTOR]!);
                                }
                            }

                            reactor.notify(this, key as string);
                        }
                    }
                }
            );
        }
    }

    public static observe<TTarget extends Indexer & Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: Action1<TTarget[TKey]>): Reactor;
    public static observe(target: Indexer & Reactiveable, path: string, listener: Action1<unknown>): Reactor;
    public static observe<TEmmiter extends Indexer = Indexer, TEmmiterKey extends keyof TEmmiter = string, TListener extends Indexer = Indexer, TListenerKey extends keyof TListener = string>(emmiter: Reactiveable<TEmmiter>, emmiterKey: TEmmiterKey, listener: TListener, listenerKey: TListenerKey): Reactor;
    public static observe(...args: [Reactiveable, string, Action1<unknown>]|[Reactiveable, string, Indexer, string]): Reactor
    {
        const [target, path] = args;

        return args.length == 3 ?
            path.includes(".") ?
                Reactive.observePath(target, path, args[2])
                : Reactive.observeProperty(target, path, args[2])
            : path.includes(".") ?
                Reactive.observePath(target, path, args[2], args[3])
                : Reactive.observeProperty(target, path, args[2], args[3]);
    }

    public static observePath(target: Indexer & Reactiveable, path: string, listener: Action1<unknown>): Reactor;
    public static observePath<TEmmiter extends Indexer = Indexer, TEmmiterKey extends keyof TEmmiter = string, TListener extends Indexer = Indexer, TListenerKey extends keyof TListener = string>(emmiter: Reactiveable<TEmmiter>, emmiterKey: TEmmiterKey, listener: TListener, listenerKey: TListenerKey): Reactor;
    public static observePath(...args: [Reactiveable, string, Action1<unknown>]|[Reactiveable, string, Indexer, string]): Reactor
    {
        const [target, path] = args;
        const [key, ...keys] = path.split(".");

        if (keys.length > 0)
        {
            if (!(key in target))
            {
                throw new Error(`Property ${key} does not exist on ${target}`);
            }

            Reactive.makeReactive(target, key);

            const reactor = target[REACTOR] = target[REACTOR] || new Reactor();
            const value   = target[key] as Indexer;

            const dependency = args.length == 3 ?
                Reactive.observePath(value, keys.join("."), args[2])
                : Reactive.observePath(value, keys.join("."), args[2], args[3]);

            if (!reactor.dependencies.has(key))
            {
                reactor.dependencies.set(key, dependency);
            }
            else
            {
                reactor.dependencies.get(key)!.register(value, dependency);
            }

            return reactor;
        }
        else
        {
            return args.length == 3 ?
                Reactive.observeProperty(target, key, args[2])
                : Reactive.observeProperty(target, key, args[2], args[3]);
        }
    }

    public static observeProperty<TTarget extends Indexer, TKey extends keyof TTarget>(target: Reactiveable<TTarget>, key: TKey, listener: Action1<TTarget[TKey]>): Reactor;
    public static observeProperty<TEmmiter extends Indexer = Indexer, TEmmiterKey extends keyof TEmmiter = string, TListener extends Indexer = Indexer, TListenerKey extends keyof TListener = string>(emmiter: Reactiveable<TEmmiter>, emmiterKey: TEmmiterKey, listener: TListener, listenerKey: TListenerKey): Reactor;
    public static observeProperty(...args: [Reactiveable, string, Action1<unknown>]|[Reactiveable, string, Reactiveable, string]): Reactor
    {
        const [target, key] = args;

        Reactive.makeReactive(target, key);

        const reactor = target[REACTOR] = target[REACTOR] || new Reactor();

        if (args.length == 3)
        {
            const listener = args[2];

            if (!reactor.observers.has(key))
            {
                reactor.observers.set(key, new Observer());
            }

            const observer = reactor.observers.get(key)!;

            observer.subscribe(listener);
            observer.notify(target[key]);
        }
        else
        {
            const [,, listener, listenerKey] = args;

            //const subscriber = listener[SUBSCRIBER] || new Subscriber(listener);

            if (!reactor.subjects.has(key))
            {
                reactor.subjects.set(key, new PropertySubject());
            }

            const subject = reactor.subjects.get(key)!;

            const observer = new PropertyObserver(listener, listenerKey);

            subject.subscribe(new PropertyObserver(listener, listenerKey));

            if (!reactor.subscriptions.has(key))
            {
                reactor.subscriptions.set(key, new Subscription(reactor));
            }

            reactor.subscriptions.get(key)!.observers.set(key, observer);

            observer.notify(target[key]);
        }

        return reactor;
    }

    public static observeTwoWay<TLeft extends Indexer = Indexer, TLeftKey extends keyof TLeft = string, TRight extends Indexer = Indexer, TRightKey extends keyof TRight = string>(left: Reactiveable<TLeft>, leftKey: TLeftKey, right: Reactiveable<TRight>, rightKey: TRightKey): void;
    public static observeTwoWay(left: Reactiveable, leftKey: string, right: Reactiveable, rightKey: string): void;
    public static observeTwoWay(left: Reactiveable, leftKey: string, right: Reactiveable, rightKey: string): void
    {
        const getMember = (target: Indexer, path: string): [Indexer, string] =>
        {
            if (path.includes("."))
            {
                const [key, ...keys] = path.split(".");

                const member = target[key];

                if (member instanceof Object)
                {
                    return getMember(member, keys.join("."));
                }
            }

            return [target, path];
        };

        const [innerLeft, innerLeftKey]   = getMember(left, leftKey);
        const [innerRight, innerRightKey] = getMember(right, rightKey);

        Reactive.observe(left, leftKey, innerRight, innerRightKey);
        Reactive.observe(right, rightKey, innerLeft, innerLeftKey);
    }
}