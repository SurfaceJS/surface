import { Indexer, Nullable }      from "@surface/core";
import { getKeyMember, getValue } from "@surface/core/common/object";
import IListener                  from "./interfaces/listener";
import IObserver                  from "./interfaces/observer";
import IReactor                   from "./interfaces/reactor";
import ISubscription              from "./interfaces/subscription";
import Reactor                    from "./internal/reactor";
import { REACTOR }                from "./internal/symbols";
import Observer                   from "./observer";
import PropertyListener           from "./property-listener";
import PropertySubscription       from "./property-subscription";

export default class Reactive
{
    private static observePath(target: Indexer, path: Array<string>): [IReactor, IReactor, IObserver]
    {
        const [key, ...keys] = path;

        if (keys.length > 0)
        {
            if (!(key in target))
            {
                throw new Error(`Property ${key} does not exist on ${target}`);
            }

            const reactor = Reactor.makeReactive(target, key);

            const value = target[key] as Indexer;

            const [endpoint, dependency, observer] = Reactive.observePath(value, keys);

            reactor.setDependency(key, dependency);

            return [endpoint, reactor, observer];
        }
        else
        {
            const [reactor, observer] = Reactive.observeProperty(target, key);

            return [reactor, reactor, observer];
        }
    }

    private static observeProperty(target: Indexer, key: string): [IReactor, IObserver]
    {
        const reactor = Reactor.makeReactive(target, key);

        const observer = reactor.getObserver(key) ?? new Observer();

        reactor.setObserver(key, observer);

        return [reactor, observer];
    }

    public static getReactor(target: Indexer|Array<unknown>): Nullable<IReactor>
    {
        return (target as { [REACTOR]?: IReactor })[REACTOR];
    }

    public static observe<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey): [IReactor, IObserver<TTarget[TKey]>];
    public static observe(target: Indexer, path: string|Array<string>): [IReactor, IObserver];
    public static observe<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: IListener<TTarget[TKey]>): [IReactor, IObserver<TTarget[TKey]>, ISubscription];
    public static observe(target: Indexer, path: string|Array<string>, listener: IListener): [IReactor, IObserver, ISubscription];
    public static observe(...args: [Indexer, string|Array<string>, IListener?]): [IReactor, IObserver]|[IReactor, IObserver, ISubscription]
    {
        const [target, pathOrKeys, listener] = args;

        const keys = Array.isArray(pathOrKeys) ? pathOrKeys : pathOrKeys.split(".");

        if (keys.length > 1)
        {
            const [reactor, , observer] = Reactive.observePath(target, keys);

            if (listener)
            {
                const subscription = observer.subscribe(listener);

                observer.notify(getValue(target, keys));

                return [reactor, observer, subscription];
            }

            return [reactor, observer];
        }
        else
        {
            const key = keys[0];

            const [reactor, observer] = Reactive.observeProperty(target, key);

            if (listener)
            {
                const subscription = observer.subscribe(listener);

                observer.notify(target[key]);

                return [reactor, observer, subscription];
            }

            return [reactor, observer];
        }
    }

    public static observeTwoWay<TLeft extends Indexer = Indexer, TLeftKey extends keyof TLeft = string, TRight extends Indexer = Indexer, TRightKey extends keyof TRight = string>(left: TLeft, leftKey: TLeftKey, right: TRight, rightKey: TRightKey): [ISubscription, ISubscription];
    public static observeTwoWay(left: Indexer, leftPath: string|Array<string>, right: Indexer, rightPath: string|Array<string>): [ISubscription, ISubscription];
    public static observeTwoWay(left: Indexer, leftPath: string|Array<string>, right: Indexer, rightPath: string|Array<string>): [ISubscription, ISubscription]
    {
        const leftKeys  = Array.isArray(leftPath)  ? leftPath  : leftPath.split(".");
        const rightKeys = Array.isArray(rightPath) ? rightPath : rightPath.split(".");

        const [leftKey,  leftMember]  = getKeyMember(left, leftPath);
        const [rightKey, rightMember] = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember, rightKey);
        const rightListener = new PropertyListener(leftMember, leftKey);

        const [leftReactor, , leftObserver]   = Reactive.observePath(left, leftKeys);
        const [rightReactor, , rightObserver] = Reactive.observePath(right, rightKeys);

        leftObserver.subscribe(leftListener);
        leftListener.notify(leftMember[leftKey]);

        const leftSubscription = new PropertySubscription(rightListener, rightObserver);

        leftReactor.setPropertySubscription(rightKey, leftSubscription);

        rightObserver.subscribe(rightListener);

        const rightSubscription = new PropertySubscription(leftListener, leftObserver);

        rightReactor.setPropertySubscription(leftKey, rightSubscription);

        return [leftSubscription, rightSubscription];
    }
}