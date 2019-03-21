import { Action1, Indexer } from "@surface/core";
import { typeGuard }        from "@surface/core/common/generic";
import Type                 from "@surface/reflection";
import FieldInfo            from "@surface/reflection/field-info";
import IListener            from "./interfaces/listener";
import IObserver            from "./interfaces/observer";
import ActionListener       from "./internal/action-listener";
import Observer             from "./internal/observer";
import PropertyListener     from "./internal/property-listener";
import Reactor              from "./internal/reactor";
import Subscription         from "./internal/subscription";
import { KEYS, REACTOR }    from "./internal/symbols";

type Reactiveable<T extends Indexer = Indexer> = T &
{
    [KEYS]?:       Array<string>;
    [REACTOR]?:    Reactor;
};

export default class Reactive
{
    private static reactivate(target: Reactiveable, reactor: Reactor)
    {
        const keys = new Set([...reactor.observers.keys(), ...reactor.dependencies.keys()]);

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

    private static makeReactive<TTarget extends Indexer, TKey extends keyof TTarget>(target: Reactiveable<TTarget>, key: TKey): void
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

    private static observePath(target: Indexer & Reactiveable, path: string, listener: IListener): [Reactor, Reactor, IObserver]
    {
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

            const [endpoint, dependency, observer] = Reactive.observePath(value, keys.join("."), listener);

            reactor.dependencies.set(key, dependency);

            reactor.toString();

            return [endpoint, reactor, observer];
        }
        else
        {
            const [reactor, observer] = Reactive.observeProperty(target, key, listener);

            return [reactor, reactor, observer];
        }
    }

    private static observeProperty<TTarget extends Indexer, TKey extends keyof TTarget>(target: Reactiveable<TTarget>, key: TKey, listener: IListener): [Reactor, IObserver]
    {
        Reactive.makeReactive(target, key);

        const reactor = target[REACTOR] = target[REACTOR] || new Reactor();

        const observer = reactor.observers.get(key as string) || new Observer();

        reactor.observers.set(key as string, observer);

        observer.subscribe(listener);
        observer.notify(target[key]);

        return [reactor, observer];
    }

    public static observe(target: Reactiveable, path: string, listener: Action1<unknown>): IObserver;
    public static observe(target: Reactiveable, path: string, listener: IListener): IObserver;
    public static observe<TTarget extends Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: Action1<TTarget[TKey]>): IObserver;
    public static observe<TTarget extends Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: IListener): IObserver;
    public static observe<TEmmiter extends Indexer = Indexer, TEmmiterKey extends keyof TEmmiter = string, TListener extends Indexer = Indexer, TListenerKey extends keyof TListener = string>(emmiter: Reactiveable<TEmmiter>, emmiterKey: TEmmiterKey, listener: TListener, listenerKey: TListenerKey): IObserver;
    public static observe(...args: [Reactiveable, string, Action1<unknown>|IListener]|[Reactiveable, string, Indexer, string]): IObserver
    {
        const [target, path] = args;

        const listener = args.length == 3 ?
            typeof args[2] == "function" ?
                new ActionListener(args[2])
                : args[2]
            : new PropertyListener(args[2], args[3]);

        return path.includes(".") ?
            Reactive.observePath(target, path, listener)[2]
            : Reactive.observeProperty(target, path, listener)[1];
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

        const leftListener  = new PropertyListener(innerRight, innerRightKey);
        const rightListener = new PropertyListener(innerLeft, innerLeftKey);

        const [leftReactor, , leftobserver] = Reactive.observePath(left, leftKey, leftListener);
        const [rightReactor, , rightObserver] = Reactive.observePath(right, rightKey, rightListener);

        const leftSubscription = leftReactor.subscriptions.get(innerRightKey) || new Subscription(rightObserver);

        leftSubscription.listeners.add(rightListener);

        leftReactor.subscriptions.set(innerRightKey, leftSubscription);

        const rightSubscription = rightReactor.subscriptions.get(innerLeftKey) || new Subscription(leftobserver);

        rightSubscription.listeners.add(leftListener);

        rightReactor.subscriptions.set(innerLeftKey, rightSubscription);
    }
}