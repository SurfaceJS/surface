import { IDisposable, Indexer, overrideProperty } from "@surface/core";
import Type, { FieldInfo, MethodInfo }            from "@surface/reflection";
import IObserver                                  from "./interfaces/observer";
import IPropertySubscription                      from "./interfaces/property-subscription";
import Metadata                                   from "./metadata";

const IS_REACTIVE = Symbol("reactive:is-reactive");
type ReactiveArray = unknown[] & Indexer & { [IS_REACTIVE]?: boolean };

export default class Reactor implements IDisposable
{
    private static readonly stack: Reactor[] = [];

    private readonly _dependencies:         Map<string, Reactor>                    = new Map();
    private readonly _observers:            Map<string, IObserver>                  = new Map();
    private readonly propertySubscriptions: Map<string, Set<IPropertySubscription>> = new Map();
    private readonly registries:            Set<Reactor>                            = new Set();

    private disposed: boolean = false;

    public get dependencies(): Map<string, Reactor>
    {
        return this._dependencies;
    }

    public get observers(): Map<string, IObserver>
    {
        return this._observers;
    }

    private static notify(target: Indexer, key: string, value: unknown): void
    {
        const metadata = Metadata.from(target);

        if (!metadata.reactor.disposed)
        {
            if (Array.isArray(value) && !(value as ReactiveArray)[IS_REACTIVE])
            {
                Reactor.wrapArray(metadata.reactor, target, key);
            }

            metadata.reactor.update(key, value);

            metadata.reactor.notify(target, key, value);
        }
    }

    private static wrapArray(reactor: Reactor, target: ReactiveArray): void;
    private static wrapArray(reactor: Reactor, target: Indexer, key: string): void;
    private static wrapArray(...args: [Reactor, ReactiveArray] | [Reactor, Indexer, string]): void
    {
        const methods = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];

        if (args.length == 2)
        {
            const [reactor, target] = args;

            for (const method of methods)
            {
                const fn = target[method] as Function;

                function wrappedFn(this: unknown[], ...args: unknown[]): unknown
                {
                    const elements = fn.apply(this, args);

                    reactor.notify(this);

                    return elements;
                }

                Object.defineProperty(target, method, { configurable: true, enumerable: false, value: wrappedFn });
            }

            target[IS_REACTIVE] = true;
        }
        else
        {
            const [reactor, target, key] = args as [Reactor, Indexer, string];

            const member = target[key] as ReactiveArray;

            for (const method of methods)
            {
                const fn = member[method] as Function;

                function wrappedFn(this: unknown[], ...args: unknown[]): unknown
                {
                    const elements = fn.apply(this, args);

                    reactor.update(key, this[Number(key)]);

                    reactor.notify(target, key);

                    return elements;
                }

                Object.defineProperty(member, method, { configurable: true, enumerable: false, value: wrappedFn });
            }

            member[IS_REACTIVE] = true;
        }
    }

    public static makeReactive(target: object, keyOrIndex: string | number): Reactor;
    public static makeReactive(target: Indexer, keyOrIndex: string | number): Reactor
    {
        const key      = keyOrIndex.toString();
        const metadata = Metadata.from(target);

        if (metadata.keys.has(key))
        {
            return metadata.reactor;
        }

        metadata.keys.add(key);

        const member = Type.from(target).getMember(key);

        if (Array.isArray(target) && !(target as ReactiveArray)[IS_REACTIVE])
        {
            Reactor.wrapArray(metadata.reactor, target);
        }

        if (Array.isArray(target[key]) && !(target[key] as ReactiveArray)[IS_REACTIVE])
        {
            Reactor.wrapArray(metadata.reactor, target, key);
        }

        if (member instanceof FieldInfo && !member.readonly || member instanceof MethodInfo)
        {
            overrideProperty(target, key, (instance, _, newValue) => Reactor.notify(instance, key, newValue), member.descriptor);
        }
        else if (!member)
        {
            throw new Error(`Property "${key}" does not exists on type ${target.constructor.name}`);
        }

        return metadata.reactor;
    }

    private notifyValue(value: Indexer): void
    {
        for (const registry of this.registries.values())
        {
            if (!Reactor.stack.includes(registry))
            {
                registry.notify(value);
            }
        }

        for (const subscriptions of this.propertySubscriptions.values())
        {
            for (const subscription of subscriptions)
            {
                subscription.update(value);
            }
        }

        for (const [key, dependency] of this.dependencies)
        {
            dependency.notify(value?.[key]);
        }

        for (const [key, observer] of this.observers)
        {
            observer.notify(value?.[key]);
        }
    }

    private notifyTargetKeyValue(target: Indexer, key: string, value: Indexer): void
    {
        for (const registry of this.registries.values())
        {
            if (!Reactor.stack.includes(registry))
            {
                registry.notify(target, key, value);
            }
        }

        for (const subscription of this.propertySubscriptions.get(key) ?? [])
        {
            subscription.update(target);
        }

        this.dependencies.get(key)?.notify(value);

        this.observers.get(key)?.notify(value);
    }

    private register(target: Indexer, registry: Reactor): void
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

                    const value = target[key] as Indexer;

                    const reactor = Metadata.from(value).reactor;

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

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.unregister();

            for (const dependency of this.dependencies.values())
            {
                dependency.dispose();
            }

            for (const propertySubscription of this.propertySubscriptions.values())
            {
                for (const subscription of Array.from(propertySubscription.values()))
                {
                    subscription.unsubscribe();
                }
            }

            this.observers.clear();
            this.dependencies.clear();
            this.propertySubscriptions.clear();

            this.disposed = true;
        }
    }

    public notify(value: unknown): void;
    public notify(target: Indexer, key: string): void;
    public notify(target: Indexer, key: string, value: unknown): void;
    public notify(...args: [unknown] | [Indexer, string] | [Indexer, string, unknown]): void
    {
        Reactor.stack.push(this);

        if (args.length == 1)
        {
            this.notifyValue(args[0] as Indexer);
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
                this.notifyTargetKeyValue(target, key, args[2] as Indexer);
            }
        }

        Reactor.stack.pop();
    }

    public setPropertySubscription(key: string, subscription: IPropertySubscription): void
    {
        let subscriptions = this.propertySubscriptions.get(key);

        if (!subscriptions)
        {
            this.propertySubscriptions.set(key, subscriptions = new Set());
        }

        subscriptions.add(subscription);

        subscription.onUnsubscribe(() => subscriptions!.delete(subscription));
    }

    public update(key: string, value: unknown): void
    {
        const dependency = this.dependencies.get(key);

        if (dependency)
        {
            dependency.unregister();

            if (value instanceof Object)
            {
                dependency.register(value as Indexer, Metadata.from(value).reactor);
            }
        }
    }
}