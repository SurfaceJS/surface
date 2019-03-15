import { Action1, Indexer } from "@surface/core";
import { typeGuard }        from "@surface/core/common/generic";
import Type                 from "@surface/reflection";
import FieldInfo            from "@surface/reflection/field-info";
import Observer             from "./internal/observer";
import Reactor              from "./internal/reactor";
import { KEYS, REACTOR }    from "./internal/symbols";

type Reactiveable<T extends Indexer = Indexer> = T &
{
    [KEYS]?:    Array<string>;
    [REACTOR]?: Reactor<T>;
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

                            const dependency = reactor.dependencies.get(key)!;

                            if (dependency && typeGuard<unknown, Reactiveable>(oldValue, x => x instanceof Object) && oldValue[REACTOR] && oldValue[REACTOR]!.registries.has(dependency))
                            {
                                oldValue[REACTOR]!.unregister(dependency);
                            }

                            if (typeGuard<unknown, Reactiveable>(value, x => x instanceof Object))
                            {
                                if (!value[REACTOR])
                                {
                                    value[REACTOR] = new Reactor(value as Indexer);
                                }

                                value[REACTOR]!.register(dependency);

                                value[REACTOR]!.update(value);
                                value[REACTOR]!.notify();

                                Reactive.reactivate(value, dependency as unknown as Reactor);
                            }

                            reactor.notify(key);
                        }
                    }
                }
            );
        }
    }

    public static observe<TTarget extends Indexer & Reactiveable, TKey extends keyof TTarget>(target: TTarget, key: TKey, listener: Action1<TTarget[TKey]>): Reactor<TTarget>;
    public static observe(target: Indexer & Reactiveable, path: string, listener: Action1<unknown>): Reactor;
    public static observe(target: Indexer & Reactiveable, path: string, listener: Action1<unknown>): Reactor
    {
        return path.indexOf(".") > -1 ? Reactive.observePath(target, path, listener) : Reactive.observeProperty(target, path, listener);
    }

    public static observePath(target: Indexer & Reactiveable, path: string, listener: Action1<unknown>): Reactor
    {
        const [key, ...keys] = path.split(".");

        if (keys.length > 0)
        {
            Reactive.makeReactive(target, key);

            const reactor = (target[REACTOR] || new Reactor(target)) as Reactor;

            if (!reactor.observers.has(key))
            {
                reactor.observers.set(key, new Observer());
            }

            if (!(key in target))
            {
                throw new Error(`Property ${key} does not exist on ${target}`);
            }

            const dependency = Reactive.observePath(target[key] as Indexer, keys.join("."), listener);

            reactor.dependencies.set(key, dependency);

            return reactor;
        }
        else
        {
            return Reactive.observeProperty(target, key, listener);
        }
    }

    public static observeProperty<TTarget extends Indexer, TKey extends keyof TTarget>(target: Reactiveable<TTarget>, key: TKey, listener: Action1<TTarget[TKey]>): Reactor<TTarget>
    {
        Reactive.makeReactive(target, key);

        const reactor = target[REACTOR] || new Reactor<TTarget>(target);

        if (!reactor.observers.has(key))
        {
            reactor.observers.set(key, new Observer());
        }

        const observer = reactor.observers.get(key as keyof TTarget)!;

        observer.subscribe(listener as Action1<TTarget[keyof TTarget]>);
        observer.notify(target[key]);

        return reactor;
    }
}