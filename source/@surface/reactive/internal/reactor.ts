import { Indexer }                        from "@surface/core";
import { hasValue, typeGuard }            from "@surface/core/common/generic";
import Type                               from "@surface/reflection";
import FieldInfo                          from "@surface/reflection/field-info";
import MethodInfo                         from "@surface/reflection/method-info";
import PropertyInfo                       from "@surface/reflection/property-info";
import IObserver                          from "../interfaces/observer";
import IPropertySubscription              from "../interfaces/property-subscription";
import { REACTOR, TRACKED_KEYS, WRAPPED } from "./symbols";

export type Reactiveable<T = Indexer> = T & { [TRACKED_KEYS]?: Array<string|number>, [REACTOR]?: Reactor, [WRAPPED]?: boolean };

export default class Reactor
{
    private static readonly stack: Array<Reactor> = [];

    private readonly _dependencies:         Map<string, Reactor>                    = new Map();
    private readonly _observers:            Map<string, IObserver>                  = new Map();
    private readonly propertySubscriptions: Map<string, Set<IPropertySubscription>> = new Map();
    private readonly registries:            Set<Reactor>                            = new Set();

    public get dependencies(): Map<string, Reactor>
    {
        return this._dependencies;
    }

    public get observers(): Map<string, IObserver>
    {
        return this._observers;
    }

    private static notify(target: Reactiveable, key: string, value: unknown): void
    {
        const reactor = target[REACTOR]!;

        if (Array.isArray(value) && !!!(value as unknown as Reactiveable)[WRAPPED])
        {
            Reactor.wrapArray(reactor, target, key);
        }

        reactor.update(key, value);

        reactor.notify(target, key, value);
    }

    private static wrapArray(reactor: Reactor, target: Array<unknown> & Reactiveable, ): void;
    private static wrapArray(reactor: Reactor, target: Reactiveable, key: string): void;
    private static wrapArray(...args: [Reactor, Array<unknown> & Reactiveable]|[Reactor, Reactiveable, string]): void
    {
        const methods = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];

        if (args.length == 2)
        {
            const [reactor, target] = args;

            for (const method of methods)
            {
                const fn = target[method] as Function;

                const wrappedFn = function(this: Array<unknown>, ...args: Array<unknown>)
                {
                    const elements = fn.apply(this, args);

                    reactor.notify(this);

                    return elements;
                };

                Object.defineProperty(target, method, { value: wrappedFn, configurable: true, enumerable: false });
            }

            target[WRAPPED] = true;
        }
        else
        {
            const [reactor, target, key] = args as [Reactor, Reactiveable, string];

            const member = target[key] as Array<unknown> & Reactiveable;

            for (const method of methods)
            {
                const fn = member[method] as Function;

                const wrappedFn = function(this: Array<unknown>, ...args: Array<unknown>)
                {
                    const elements = fn.apply(this, args);

                    reactor.notify(target, key);

                    return elements;
                };

                Object.defineProperty(member, method, { value: wrappedFn, configurable: true, enumerable: false });
            }

            member[WRAPPED] = true;
        }
    }

    public static makeReactive<TTarget extends object, TKey extends keyof TTarget>(target: TTarget, key: TKey): Reactor;
    public static makeReactive(target: Reactiveable, _key: string|number): Reactor
    {
        const key     = _key.toString();
        const reactor = target[REACTOR]      = target[REACTOR]      ?? new Reactor();
        const keys    = target[TRACKED_KEYS] = target[TRACKED_KEYS] ?? [] as Array<string|number>;

        if (keys.includes(key))
        {
            return reactor;
        }

        keys.push(key);

        const member = Type.from(target).getMember(key);

        if (!!!target[WRAPPED] && Array.isArray(target))
        {
            Reactor.wrapArray(reactor, target);
        }

        if (Array.isArray(target[key]) && !!!(target[key] as Reactiveable)[WRAPPED]) //Todo: Investigate context breaking
        {
            Reactor.wrapArray(reactor, target, key);
        }

        if (member instanceof PropertyInfo)
        {
            const privateKey = `_${key}`;

            if (!member.readonly)
            {
                Object.defineProperty
                (
                    target,
                    key,
                    {
                        get(this: Indexer)
                        {
                            return member.getter!.call(this);
                        },
                        set(this: Indexer, value: unknown)
                        {
                            const oldValue = member.getter!.call(this);

                            if (!Object.is(oldValue, value))
                            {
                                member.setter!.call(this, value);

                                Reactor.notify(this, key, value);
                            }
                        }
                    }
                );
            }
            else if (privateKey in target)
            {
                const hiddenKey = `_${key}_`;

                target[hiddenKey] = target[key];

                Object.defineProperty
                (
                    target,
                    privateKey,
                    {
                        get(this: Indexer)
                        {
                            return this[hiddenKey];
                        },
                        set(this: Indexer, value: unknown)
                        {
                            const oldValue = this[hiddenKey];

                            if (!Object.is(oldValue, value))
                            {
                                this[hiddenKey] = value;

                                Reactor.notify(this, key, value);
                            }
                        }
                    }
                );
            }
        }
        else if (member instanceof FieldInfo && !member.readonly || member instanceof MethodInfo)
        {
            const privateKey = `_${key}`;

            target[privateKey] = target[key];

            Object.defineProperty
            (
                target,
                key,
                {
                    get(this: Indexer)
                    {
                        return this[privateKey];
                    },
                    set(this: Indexer, value: unknown)
                    {
                        const oldValue = this[privateKey];

                        if (!Object.is(oldValue, value))
                        {
                            this[privateKey] = value;

                            Reactor.notify(this, key, value);
                        }
                    }
                }
            );
        }
        else if (!member)
        {
            throw new Error(`Key ${key} does not exists on type ${target.constructor.name}`);
        }

        return reactor;
    }

    private notifyValue(value: Indexer): void
    {
        if (!hasValue(value))
        {
            return;
        }

        for (const registry of this.registries.values())
        {
            registry.notify(value);
        }

        for (const subscriptions of this.propertySubscriptions.values())
        {
            for (const subscription of subscriptions)
            {
                subscription.update(value);
            }
        }

        for (const [key, dependency] of this._dependencies)
        {
            dependency.notify(value[key]);
        }

        for (const [key, observer] of this._observers)
        {
            const keyValue = value[key];

            if (hasValue(keyValue))
            {
                observer.notify(keyValue);
            }
        }
    }

    private notifyTargetKeyValue(target: Indexer, key: string, value: Indexer): void
    {
        if (!hasValue(value))
        {
            return;
        }

        for (const registry of this.registries.values())
        {
            registry.notify(target, key, value);
        }

        for (const subscription of this.propertySubscriptions.get(key) ?? [])
        {
            subscription.update(target);
        }

        this._dependencies.get(key)?.notify(value);

        this._observers.get(key)?.notify(value);
    }

    private register(target: Reactiveable, registry: Reactor): void
    {
        if (registry != this)
        {
            for (const [key, dependency] of this._dependencies)
            {
                if (registry._dependencies.has(key))
                {
                    dependency.register(target[key] as Indexer, registry._dependencies.get(key)!);
                }
                else
                {
                    Reactor.makeReactive(target, key);

                    const value = target[key] as Reactiveable;

                    const reactor = value[REACTOR] = value[REACTOR] ?? new Reactor();

                    registry._dependencies.set(key, reactor);

                    dependency.register(value, reactor);
                }
            }

            for (const key of this._observers.keys())
            {
                Reactor.makeReactive(target, key);
            }

            registry.registries.add(this);

            this.registries.add(registry);
        }
    }

    private unregister(): void
    {
        for (const dependency of this._dependencies.values())
        {
            dependency.unregister();
        }

        for (const registry of this.registries)
        {
            registry.registries.delete(this);
        }

        this.registries.clear();
    }

    public notify(value: unknown): void;
    public notify<TTarget extends object | Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey): void;
    public notify<TTarget extends object | Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey, value: TTarget[TKey]): void;
    public notify(...args: [unknown]|[Indexer, string]|[Indexer, string, unknown]): void
    {
        if (Reactor.stack.includes(this))
        {
            return;
        }

        const value = args.length == 1 ? args[0] : args.length == 2 ? args[0][args[1]] : args[2];

        Reactor.stack.push(this);

        if (args.length == 1)
        {
            this.notifyValue(value as Indexer);
        }
        else
        {
            const [target, key] = args;

            if (args.length == 2)
            {
                this.notifyTargetKeyValue(target, key, target[key] as Indexer);
            }
            else
            {
                this.notifyTargetKeyValue(target, key, value as Indexer);
            }
        }

        Reactor.stack.pop();
    }

    public setPropertySubscription(key: string, subscription: IPropertySubscription): void
    {
        const subscriptions = this.propertySubscriptions.get(key) ?? new Set();

        this.propertySubscriptions.set(key, subscriptions);

        subscriptions.add(subscription);

        subscription.onUnsubscribe(() => subscriptions.delete(subscription));
    }

    public update(key: string, value: unknown)
    {
        const dependency = this._dependencies.get(key);

        if (dependency)
        {
            dependency.unregister();

            if (typeGuard<Reactiveable>(value, value instanceof Object))
            {
                const reactor = value[REACTOR] ?? new Reactor();

                dependency.register(value, reactor);
            }
        }
    }
}