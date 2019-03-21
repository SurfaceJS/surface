import { Indexer }             from "@surface/core";
import { hasValue, typeGuard } from "@surface/core/common/generic";
import { uuidv4 }              from "@surface/core/common/string";
import IObserver               from "../interfaces/observer";
import Subscription            from "./subscription";
import { REACTOR }             from "./symbols";

export type Monitored<T = Indexer> = T & { [REACTOR]?: Reactor };

export default class Reactor
{
    private static readonly stack: Array<Reactor> = [];

    private readonly _dependencies:  Map<string, Reactor>         = new Map();
    private readonly _observers:     Map<string, IObserver>       = new Map();
    private readonly _registries:    Set<Reactor>                 = new Set();
    private readonly _subscriptions: Map<string, Subscription>    = new Map();

    private _id: string = "";

    public get dependencies(): Map<string, Reactor>
    {
        return this._dependencies;
    }

    public get id(): string
    {
        return this._id = this._id || uuidv4();
    }

    public get observers(): Map<string, IObserver>
    {
        return this._observers;
    }

    public get registries(): Set<Reactor>
    {
        return this._registries;
    }

    public get subscriptions(): Map<string, Subscription>
    {
        return this._subscriptions;
    }

    public notify(value: unknown): void;
    public notify(target: Indexer, key: string): void;
    public notify(...args: [unknown]|[Indexer, string]): void
    {
        if (Reactor.stack.includes(this))
        {
            return;
        }

        const value = args.length == 1 ? args[0] : args[0][args[1]];

        if (!hasValue(value))
        {
            return;
        }

        Reactor.stack.push(this);

        if (args.length == 1)
        {
            for (const registry of this.registries.values())
            {
                registry.notify(value);
            }

            if (typeGuard<unknown, Indexer>(value, x => x instanceof Object))
            {
                for (const subscription of this.subscriptions.values())
                {
                    subscription.update(value);
                }

                for (const [key, observer] of this.observers)
                {
                    observer.notify(value[key]);
                }
            }
            else
            {
                this.notify(value);
            }
        }
        else
        {
            const [target, key] = args;

            if (this.subscriptions.has(key))
            {
                this.subscriptions.get(key)!.update(target);
            }

            if (this.dependencies.has(key))
            {
                const dependency = this.dependencies.get(key)!;

                if (dependency.dependencies.size > 0)
                {
                    for (const dependencyKey of dependency.dependencies.keys())
                    {
                        dependency.notify(value as Indexer, dependencyKey);
                    }
                }
                else
                {
                    dependency.notify(value);
                }
            }

            for (const registry of this.registries.values())
            {
                registry.notify(target, key);
            }

            if (this.observers.has(key))
            {
                this.observers.get(key)!.notify(value);
            }
        }

        Reactor.stack.pop();
    }

    public register(target: Monitored, registry: Reactor): void
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
                    const value = target[key] as Monitored;

                    const reactor = value[REACTOR] = value[REACTOR] || new Reactor();

                    registry.dependencies.set(key, reactor);
                    dependency.register(value, reactor);
                }
            }

            registry.registries.add(this);
            this.registries.add(registry);
        }
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

    public unregister(): void
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
}