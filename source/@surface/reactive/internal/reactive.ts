import { getKeyMember, getValue, Indexer } from "@surface/core";
import IListener                           from "./interfaces/listener";
import IObserver                           from "./interfaces/observer";
import IReactor                            from "./interfaces/reactor";
import ISubscription                       from "./interfaces/subscription";
import Metadata                            from "./metadata";
import Observer                            from "./observer";
import PropertyListener                    from "./property-listener";
import PropertySubscription                from "./property-subscription";
import Reactor                             from "./reactor";

export default class Reactive
{
    private static observePath(target: Indexer, path: Array<string>): { root: IReactor, dependency: IReactor, observer: IObserver }
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

            const { root, dependency, observer } = Reactive.observePath(value, keys);

            reactor.dependencies.set(key, dependency);

            return { root, dependency: reactor, observer };
        }
        else
        {
            const { reactor, observer } = Reactive.observeProperty(target, key);

            return { root: reactor, dependency: reactor, observer };
        }
    }

    private static observeProperty(target: Indexer, key: string): { reactor: IReactor, observer: IObserver }
    {
        const reactor = Reactor.makeReactive(target, key);

        let observer = reactor.observers.get(key);

        if (!observer)
        {
            reactor.observers.set(key, observer = new Observer());
        }

        return { reactor, observer };
    }

    public static dispose<T extends object>(target: T): void
    {
        const metadata = Metadata.of(target);

        if (metadata)
        {
            metadata.disposables.forEach(x => x.dispose());
            metadata.reactor.dispose();
        }
    }

    public static getReactor(target: object): IReactor|undefined
    {
        return Metadata.of(target)?.reactor;
    }

    public static hasObserver<T extends Indexer>(target: T, key: keyof T): boolean
    {
        return Metadata.of(target)?.reactor.observers.has(key as string) ?? false;
    }

    public static observe<TTarget extends object, TKey extends keyof TTarget>(target: TTarget, key: TKey): { reactor: IReactor, observer: IObserver<TTarget[TKey]> };
    public static observe(target: object, path: string|Array<string>): { reactor: IReactor, observer: IObserver };
    public static observe<TTarget extends object, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: IListener<TTarget[TKey]>, lazy?: boolean): { reactor: IReactor, observer: IObserver<TTarget[TKey]>, subscription: ISubscription };
    public static observe(target: object, path: string|Array<string>, listener: IListener, lazy?: boolean): { reactor: IReactor, observer: IObserver, subscription: ISubscription };
    public static observe(...args: [Indexer, string|Array<string>, IListener?, boolean?]): { reactor: IReactor, observer: IObserver, subscription?: ISubscription }
    {
        const [target, pathOrKeys, listener, lazy] = args;

        const keys = Array.isArray(pathOrKeys) ? pathOrKeys : pathOrKeys.split(".");

        if (keys.length > 1)
        {
            const { root: reactor, observer } = Reactive.observePath(target, keys);

            if (listener)
            {
                const subscription = observer.subscribe(listener);

                if (!lazy)
                {
                    observer.notify(getValue(target, keys));
                }

                return { reactor, observer, subscription };
            }

            return { reactor, observer };
        }
        else
        {
            const key = keys[0];

            const { reactor, observer } = Reactive.observeProperty(target, key);

            if (listener)
            {
                const subscription = observer.subscribe(listener);

                if (!lazy)
                {
                    observer.notify(target[key]);
                }

                return { reactor, observer, subscription };
            }

            return { reactor, observer };
        }
    }

    public static observeTwoWay<TLeft extends Indexer = Indexer, TLeftKey extends keyof TLeft = string, TRight extends Indexer = Indexer, TRightKey extends keyof TRight = string>(left: TLeft, leftKey: TLeftKey, right: TRight, rightKey: TRightKey): [ISubscription, ISubscription];
    public static observeTwoWay(left: Indexer, leftPath: string|Array<string>, right: Indexer, rightPath: string|Array<string>): [ISubscription, ISubscription];
    public static observeTwoWay(left: Indexer, leftPath: string|Array<string>, right: Indexer, rightPath: string|Array<string>): [ISubscription, ISubscription]
    {
        const leftKeys  = Array.isArray(leftPath)  ? leftPath  : leftPath.split(".");
        const rightKeys = Array.isArray(rightPath) ? rightPath : rightPath.split(".");

        const { key: leftKey,  member: leftMember }  = getKeyMember(left, leftPath);
        const { key: rightKey, member: rightMember } = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember, rightKey);
        const rightListener = new PropertyListener(leftMember, leftKey);

        const { root: leftReactor,  observer: leftObserver }  = Reactive.observePath(left, leftKeys);
        const { root: rightReactor, observer: rightObserver } = Reactive.observePath(right, rightKeys);

        leftObserver.subscribe(leftListener);
        leftListener.notify(leftMember[leftKey]);

        const leftSubscription = new PropertySubscription(rightListener, rightObserver);

        leftReactor.setPropertySubscription(rightKey, leftSubscription);

        rightObserver.subscribe(rightListener);

        const rightSubscription = new PropertySubscription(leftListener, leftObserver);

        rightReactor.setPropertySubscription(leftKey, rightSubscription);

        return [leftSubscription, rightSubscription];
    }

    public static notify<T extends object>(target: T, key: keyof T): void;
    public static notify(target: object, key: string): void;
    public static notify(target: Indexer, key: string): void
    {
        const reactor = Metadata.of(target)?.reactor;

        if (reactor)
        {
            reactor.notify(target, key);
        }
        else
        {
            throw new Error("Target is not reactive");
        }
    }
}