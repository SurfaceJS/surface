import { Indexer, Nullable }      from "@surface/core";
import { hasValue, typeGuard }    from "@surface/core/common/generic";
import { uuidv4 }                 from "@surface/core/common/string";
import Type                       from "@surface/reflection";
import FieldInfo                  from "@surface/reflection/field-info";
import MethodInfo                 from "@surface/reflection/method-info";
import PropertyInfo               from "@surface/reflection/property-info";
import IObserver                  from "../interfaces/observer";
import IPropertySubscription      from "../interfaces/property-subscription";
import ISubscription              from "../interfaces/subscription";
import { KEYS, REACTOR, WRAPPED } from "./symbols";

export type Reactiveable<T = Indexer> = T & { [KEYS]?: Array<string>, [REACTOR]?: Reactor, [WRAPPED]?: boolean };

export default class Reactor
{
    private static readonly stack: Array<Reactor> = [];

    private readonly dependencies:  Map<string, Reactor>                                  = new Map();
    private readonly observers:     Map<string, IObserver>                                = new Map();
    private readonly registries:    Set<Reactor>                                          = new Set();
    private readonly subscriptions: Map<string, Set<ISubscription|IPropertySubscription>> = new Map();

    private _id: string = "";

    public get id(): string
    {
        return this._id = this._id || uuidv4();
    }

    private static notify(target: Reactiveable, key: string): void;
    private static notify(target: Reactiveable, key: string, value: unknown): void;
    private static notify(...args: [Reactiveable, string]|[Reactiveable, string, unknown]): void
    {
        const [target, key] = args;

        const value = args.length == 2 ? target[key] : args[2];

        const reactor = target[REACTOR]!;

        if (Array.isArray(value) && !!!(value as Reactiveable)[WRAPPED])
        {
            Reactor.wrapArray(reactor, target, key);
        }

        reactor.update(key, value);

        args.length == 2 ? reactor.notify(target, key) : reactor.notify(target, key, value);
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

    public static makeReactive(target: Reactiveable, key: string): Reactor
    {
        const reactor = target[REACTOR] = target[REACTOR] || new Reactor();
        const keys    = target[KEYS]    = target[KEYS]    || [] as Array<string>;

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

                                Reactor.notify(this, key);
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

                                Reactor.notify(this, key);
                            }
                        }
                    }
                );
            }
        }
        else if (member instanceof FieldInfo && !member.readonly)
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

                            Reactor.notify(this, key);
                        }
                    }
                }
            );

        }
        else if (member instanceof MethodInfo)
        {
            let cache     = null as unknown;
            let notifying = false;

            const wrappedFn = function(this: Indexer, ...args: Array<unknown>)
            {
                if (!notifying)
                {
                    const result = cache = member.invoke.apply(this, args);

                    notifying = true;

                    Reactor.notify(this, key, result);

                    notifying = false;

                    return result;
                }
                else
                {
                    return cache;
                }
            };

            Object.defineProperty(target, key, { value: wrappedFn, configurable: true, enumerable: false });
        }

        return reactor;
    }

    private notifyValue(value: Indexer): void
    {
        for (const registry of this.registries.values())
        {
            registry.notify(value);
        }

        for (const subscriptions of this.subscriptions.values())
        {
            for (const subscription of subscriptions)
            {
                if ("update" in subscription)
                {
                    subscription.update(value);
                }
            }
        }

        for (const [key, dependency] of this.dependencies)
        {
            dependency.notify(value[key]);
        }

        for (const [key, observer] of this.observers)
        {
            observer.notify(value[key]);
        }
    }

    private notifyTargetKey(target: Indexer, key: string): void
    {
        this.notifyTargetKeyValue(target, key, target[key] as Indexer);
    }

    private notifyTargetKeyValue(target: Indexer, key: string, value: Indexer): void
    {
        if (this.subscriptions.has(key))
        {
            for (const subscription of this.subscriptions.get(key)!)
            {
                if ("update" in subscription)
                {
                    subscription.update(target);
                }
            }
        }

        if (this.dependencies.has(key))
        {
            this.dependencies.get(key)!.notify(value);
        }

        for (const registry of this.registries.values())
        {
            registry.notify(target, key, value);
        }

        if (this.observers.has(key))
        {
            this.observers.get(key)!.notify(value);
        }
    }

    private register(target: Reactiveable, registry: Reactor): void
    {
        if (registry != this)
        {
            for (const [key, dependency] of this.dependencies)
            {
                if (registry.dependencies.has(key))
                {
                    dependency.register(target[key] as Indexer, registry.dependencies.get(key)!);
                }
                else
                {
                    Reactor.makeReactive(target, key);

                    const value = target[key] as Reactiveable;

                    const reactor = value[REACTOR] = value[REACTOR] || new Reactor();

                    registry.dependencies.set(key, reactor);
                    dependency.register(value, reactor);
                }
            }

            for (const key of this.observers.keys())
            {
                Reactor.makeReactive(target, key);
            }

            registry.registries.add(this);
            this.registries.add(registry);
        }
    }

    private unregister(): void
    {
        for (const dependency of this.dependencies.values())
        {
            dependency.unregister();
        }

        for (const registry of this.registries)
        {
            registry.registries.delete(this);
        }

        this.registries.clear();
    }

    public getDependency(key: string): Nullable<Reactor>
    {
        return this.dependencies.get(key);
    }

    public getObserver(key: string): Nullable<IObserver>
    {
        return this.observers.get(key);
    }

    public notify(value: unknown): void;
    public notify<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey): void;
    public notify<TTarget extends Indexer, TKey extends keyof TTarget>(target: TTarget, key: TKey, value: TTarget[TKey]): void;
    public notify(...args: [unknown]|[Indexer, string]|[Indexer, string, unknown]): void
    {
        if (Reactor.stack.includes(this))
        {
            return;
        }

        const value = args.length == 1 ? args[0] : args.length == 2 ? args[0][args[1]] : args[2];

        if (!hasValue(value))
        {
            return;
        }

        Reactor.stack.push(this);

        if (args.length == 1)
        {
            this.notifyValue(value);
        }
        else
        {
            const [target, key] = args;

            if (args.length == 2)
            {
                this.notifyTargetKey(target, key);
            }
            else
            {
                this.notifyTargetKeyValue(target, key, value);
            }
        }

        Reactor.stack.pop();
    }

    public setDependency(key: string, dependency: Reactor): void
    {
        this.dependencies.set(key, dependency);
    }

    public setObserver(key: string, observer: IObserver): void
    {
        this.observers.set(key, observer);
    }

    public setSubscription(key: string, subscription: ISubscription): void
    {
        const subscriptions = this.subscriptions.get(key) || new Set();

        this.subscriptions.set(key, subscriptions);

        subscriptions.add(subscription);
    }

    public toString(): string
    {
        if (Reactor.stack.includes(this))
        {
            return `"[circular ${this.id}]"`;
        }

        Reactor.stack.push(this);

        const keys = [`"id": "${this.id}"`];

        if (this.dependencies.size > 0)
        {
            const dependencies =  Array.from(this.dependencies)
                .map(([key, dependency]) => `"${key}": ${dependency.toString()}`)
                .join(", ");

            keys.push(`"dependencies": { ${dependencies} }`);
        }

        if (this.observers.size > 0)
        {
            const observers =  Array.from(this.observers)
                .map(([key, observer]) => `"${key}": ${observer.toString()}`)
                .join(", ");

            keys.push(`"observers": { ${observers} }`);
        }

        if (this.registries.size > 0)
        {
            const registries =  Array.from(this.registries)
                .map(x => x.toString())
                .join(", ");

            keys.push(`"registries": [${registries}]`);
        }

        if (this.subscriptions.size > 0)
        {
            const subscriptions =  Array.from(this.subscriptions)
                .map(([key, subscription]) => `"${key}": ${subscription.toString()}`)
                .join(", ");

            keys.push(`"subscriptions": { ${subscriptions} }`);
        }

        Reactor.stack.pop();

        return `{ ${keys.join(", ")} }`;
    }

    public update(key: string, value: unknown)
    {
        const dependency = this.dependencies.get(key);

        if (dependency)
        {
            dependency.unregister();

            if (typeGuard<unknown, Reactiveable>(value, x => x instanceof Object))
            {
                const reactor = value[REACTOR] || new Reactor();

                dependency.register(value, reactor);
            }
        }
    }
}