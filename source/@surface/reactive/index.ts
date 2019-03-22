import { Action1, Indexer }       from "@surface/core";
import { typeGuard }              from "@surface/core/common/generic";
import { getKeyMember, getValue } from "@surface/core/common/object";
import Type                       from "@surface/reflection";
import FieldInfo                  from "@surface/reflection/field-info";
import IListener                  from "./interfaces/listener";
import IObserver                  from "./interfaces/observer";
import ISubscription              from "./interfaces/subscription";
import ActionListener             from "./internal/action-listener";
import Observer                   from "./internal/observer";
import PropertyListener           from "./internal/property-listener";
import Reactor                    from "./internal/reactor";
import Subscription               from "./internal/subscription";
import { KEYS, REACTOR }          from "./internal/symbols";

type Reactiveable<T extends Indexer = Indexer> = T &
{
    [KEYS]?:    Array<string>;
    [REACTOR]?: Reactor;
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

    private static observePath(target: Indexer & Reactiveable, path: string): [Reactor, Reactor, IObserver]
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

            const [endpoint, dependency, observer] = Reactive.observePath(value, keys.join("."));

            reactor.dependencies.set(key, dependency);

            reactor.toString();

            return [endpoint, reactor, observer];
        }
        else
        {
            const [reactor, observer] = Reactive.observeProperty(target, key);

            return [reactor, reactor, observer];
        }
    }

    private static observeProperty<TTarget extends Indexer, TKey extends keyof TTarget>(target: Reactiveable<TTarget>, key: TKey): [Reactor, IObserver]
    {
        Reactive.makeReactive(target, key);

        const reactor = target[REACTOR] = target[REACTOR] || new Reactor();

        const observer = reactor.observers.get(key as string) || new Observer();

        reactor.observers.set(key as string, observer);

        return [reactor, observer];
    }

    public static observe<TTarget extends Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey): IObserver<TTarget[TKey]>;
    public static observe<TTarget extends Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: Action1<TTarget[TKey]>): [IObserver<TTarget[TKey]>, ISubscription];
    public static observe<TTarget extends Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: IListener<TTarget[TKey]>): [IObserver<TTarget[TKey]>, ISubscription];
    public static observe<TEmmiter extends Indexer = Indexer, TEmmiterKey extends keyof TEmmiter = string, TListener extends Indexer = Indexer, TListenerKey extends keyof TListener = string>(emmiter: Reactiveable<TEmmiter>, emmiterKey: TEmmiterKey, listener: TListener, listenerKey: TListenerKey): [IObserver, ISubscription];
    public static observe(target: Reactiveable, path: string): IObserver;
    public static observe(target: Reactiveable, path: string, listener: Action1<unknown>): [IObserver, ISubscription];
    public static observe(target: Reactiveable, path: string, listener: IListener): [IObserver, ISubscription];
    public static observe(...args: [Reactiveable, string]|[Reactiveable, string, Action1<unknown>|IListener]|[Reactiveable, string, Indexer, string]): IObserver|[IObserver, ISubscription]
    {
        const [target, path] = args;

        const listener = args.length == 2
            ? null
            : args.length == 3 ?
                typeof args[2] == "function" ?
                    new ActionListener(args[2])
                    : args[2]
                : new PropertyListener(args[2], args[3]);

        if (path.includes("."))
        {
            const [ , , observer] = Reactive.observePath(target, path);

            if (listener)
            {
                const subscription = observer.subscribe(listener);
                observer.notify(getValue(target, path));

                return [observer, subscription];
            }

            return observer;
        }
        else
        {
            const [ , observer] = Reactive.observeProperty(target, path);

            if (listener)
            {
                const subscription = observer.subscribe(listener);

                observer.notify(target[path]);

                return [observer, subscription];
            }

            return observer;
        }
    }

    public static observeTwoWay<TLeft extends Indexer = Indexer, TLeftKey extends keyof TLeft = string, TRight extends Indexer = Indexer, TRightKey extends keyof TRight = string>(left: Reactiveable<TLeft>, leftKey: TLeftKey, right: Reactiveable<TRight>, rightKey: TRightKey): [ISubscription, ISubscription];
    public static observeTwoWay(left: Reactiveable, leftKey: string, right: Reactiveable, rightKey: string): [ISubscription, ISubscription];
    public static observeTwoWay(left: Reactiveable, leftKey: string, right: Reactiveable, rightKey: string): [ISubscription, ISubscription]
    {
        const [innerLeftKey,  innerLeft]  = getKeyMember(left, leftKey);
        const [innerRightKey, innerRight] = getKeyMember(right, rightKey);

        const leftListener  = new PropertyListener(innerRight, innerRightKey);
        const rightListener = new PropertyListener(innerLeft, innerLeftKey);

        const [leftReactor, , leftObserver]   = Reactive.observePath(left, leftKey);
        const [rightReactor, , rightObserver] = Reactive.observePath(right, rightKey);

        leftObserver.subscribe(leftListener);
        leftObserver.notify(innerLeft[innerLeftKey]);

        rightObserver.subscribe(rightListener);
        rightObserver.notify(innerRight[innerRightKey]);

        const leftSubscription = leftReactor.subscriptions.get(innerRightKey) || new Subscription(rightObserver);

        leftSubscription.listeners.add(rightListener);

        leftReactor.subscriptions.set(innerRightKey, leftSubscription);

        const rightSubscription = rightReactor.subscriptions.get(innerLeftKey) || new Subscription(leftObserver);

        rightSubscription.listeners.add(leftListener);

        rightReactor.subscriptions.set(innerLeftKey, rightSubscription);

        return [leftSubscription, rightSubscription];
    }
}