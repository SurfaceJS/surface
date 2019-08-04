import { Indexer, Nullable }      from "@surface/core";
import { getKeyMember, getValue } from "@surface/core/common/object";
import IExpression                from "@surface/expression/interfaces/expression";
import IListener                  from "./interfaces/listener";
import IObserver                  from "./interfaces/observer";
import IReactor                   from "./interfaces/reactor";
import ISubscription              from "./interfaces/subscription";
import Observer                   from "./internal/observer";
import PropertyListener           from "./internal/property-listener";
import PropertySubscription       from "./internal/property-subscription";
import ReactiveVisitor            from "./internal/reactive-visitor";
import Reactor                    from "./internal/reactor";
import { REACTOR }                from "./internal/symbols";

export default class Reactive
{
    private static observePath(target: Indexer, path: string): [IReactor, IReactor, IObserver]
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

        const observer = reactor.getObserver(key) || new Observer();

        reactor.setObserver(key, observer);

        return [reactor, observer];
    }

    public static getReactor(target: Indexer): Nullable<IReactor>
    {
        return (target as { [REACTOR]?: IReactor })[REACTOR];
    }

    public static observe<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey): [IReactor, IObserver<TTarget[TKey]>];
    public static observe(target: Indexer, path: string): [IReactor, IObserver];
    public static observe<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: IListener<TTarget[TKey]>): [IReactor, IObserver<TTarget[TKey]>, ISubscription];
    public static observe(target: Indexer, path: string, listener: IListener): [IReactor, IObserver, ISubscription];
    public static observe(expression: IExpression, scope: Indexer, listener: IListener): ISubscription;
    public static observe(...args: [Indexer, string]|[IExpression, Indexer, IListener]|[Indexer, string, IListener]): [IReactor, IObserver]|[IReactor, IObserver, ISubscription]|ISubscription
    {
        if (args.length == 3 && "evaluate" in args[0] && typeof args[1] != "string")
        {
            const [expression, scope, listener] = args as [IExpression, Indexer, IListener];

            const visitor = new ReactiveVisitor(listener, scope);

            return visitor.observe(expression);
        }
        else
        {
            const [target, path, listener] = args as [Indexer, string, Nullable<IListener>];

            if (path.includes("."))
            {
                const [reactor, , observer] =  Reactive.observePath(target, path);

                if (listener)
                {
                    const subscription = observer.subscribe(listener);

                    observer.notify(getValue(target, path));

                    return [reactor, observer, subscription];
                }

                return [reactor, observer];
            }
            else
            {
                const [reactor, observer] = Reactive.observeProperty(target, path);

                if (listener)
                {
                    const subscription = observer.subscribe(listener);

                    observer.notify(target[path]);

                    return [reactor, observer, subscription];
                }

                return [reactor, observer];
            }
        }
    }

    public static observeTwoWay<TLeft extends Indexer = Indexer, TLeftKey extends keyof TLeft = string, TRight extends Indexer = Indexer, TRightKey extends keyof TRight = string>(left: TLeft, leftKey: TLeftKey, right: TRight, rightKey: TRightKey): [ISubscription, ISubscription];
    public static observeTwoWay(left: Indexer, leftPath: string, right: Indexer, rightPath: string): [ISubscription, ISubscription];
    public static observeTwoWay(left: Indexer, leftPath: string, right: Indexer, rightPath: string): [ISubscription, ISubscription]
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