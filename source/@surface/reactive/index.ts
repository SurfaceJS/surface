import { Action1, Indexer }       from "@surface/core";
import { getKeyMember, getValue } from "@surface/core/common/object";
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
    private static observePath(target: Reactiveable, path: string): [Reactor, Reactor, IObserver]
    {
        const [key, ...keys] = path.split(".");

        if (keys.length > 0)
        {
            if (!(key in target))
            {
                throw new Error(`Property ${key} does not exist on ${target}`);
            }

            Reactor.makeReactive(target, key);

            const reactor = target[REACTOR] = target[REACTOR] || new Reactor();
            const value   = target[key] as Indexer;

            const [endpoint, dependency, observer] = Reactive.observePath(value, keys.join("."));

            reactor.setDependency(key, dependency);

            reactor.toString();

            return [endpoint, reactor, observer];
        }
        else
        {
            const [reactor, observer] = Reactive.observeProperty(target, key);

            return [reactor, reactor, observer];
        }
    }

    private static observeProperty(target: Reactiveable, key: string): [Reactor, IObserver]
    {
        Reactor.makeReactive(target, key);

        const reactor = target[REACTOR] = target[REACTOR] || new Reactor();

        const observer = reactor.getObserver(key) || new Observer();

        reactor.setObserver(key, observer);

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

        const leftSubscription = leftReactor.getSubscription(innerRightKey) || new Subscription(rightObserver);

        leftSubscription.addListener(rightListener);

        leftReactor.setSubscription(innerRightKey, leftSubscription);

        const rightSubscription = rightReactor.getSubscription(innerLeftKey) || new Subscription(leftObserver);

        rightSubscription.addListener(leftListener);

        rightReactor.setSubscription(innerLeftKey, rightSubscription);

        return [leftSubscription, rightSubscription];
    }
}