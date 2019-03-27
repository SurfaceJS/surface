import { Action1, Indexer, Nullable } from "@surface/core";
import { getKeyMember, getValue }     from "@surface/core/common/object";
import IListener                      from "./interfaces/listener";
import IObserver                      from "./interfaces/observer";
import IReactor                       from "./interfaces/reactor";
import ISubscription                  from "./interfaces/subscription";
import ActionListener                 from "./internal/action-listener";
import Observer                       from "./internal/observer";
import PropertyListener               from "./internal/property-listener";
import PropertySubscription           from "./internal/property-subscription";
import Reactor                        from "./internal/reactor";
import { REACTOR }                    from "./internal/symbols";

type Reactiveable<T extends Indexer = Indexer> = T &
{
    [REACTOR]?: IReactor;
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

            const reactor = Reactor.makeReactive(target, key);
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
        const reactor = Reactor.makeReactive(target, key);

        const observer = reactor.getObserver(key) || new Observer();

        reactor.setObserver(key, observer);

        return [reactor, observer];
    }

    public static getReactor(target: Reactiveable): Nullable<IReactor>
    {
        return target[REACTOR];
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
    public static observeTwoWay(left: Reactiveable, leftPath: string, right: Reactiveable, rightPath: string): [ISubscription, ISubscription];
    public static observeTwoWay(left: Reactiveable, leftPath: string, right: Reactiveable, rightPath: string): [ISubscription, ISubscription]
    {
        const [leftKey,  leftMember]  = getKeyMember(left, leftPath);
        const [rightKey, rightMember] = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember, rightKey);
        const rightListener = new PropertyListener(leftMember, leftKey);

        const [leftReactor, , leftObserver]   = Reactive.observePath(left, leftPath);
        const [rightReactor, , rightObserver] = Reactive.observePath(right, rightPath);

        leftObserver.subscribe(leftListener);
        leftListener.notify(leftMember[leftKey]);

        const leftSubscription = new PropertySubscription(rightListener, rightObserver);

        leftReactor.setSubscription(rightKey, leftSubscription);

        rightObserver.subscribe(rightListener);

        const rightSubscription = new PropertySubscription(leftListener, leftObserver);

        rightReactor.setSubscription(leftKey, rightSubscription);

        return [leftSubscription, rightSubscription];
    }
}