import { Indexer }             from "@surface/core";
import { hasValue, typeGuard } from "@surface/core/common/generic";
import Observer                from "./observer";
import PropertySubject         from "./property-subject";
import { Subscription }        from "./subscriber";
import { REACTOR }             from "./symbols";

export type Monitored<T = Indexer> = T & { [REACTOR]?: Reactor };

export default class Reactor
{
    private static readonly stack: Array<Reactor> = [];

    private readonly _dependencies:  Map<string, Reactor>         = new Map();
    private readonly _observers:     Map<string, Observer>        = new Map();
    private readonly _registries:    Set<Reactor>                 = new Set();
    private readonly _subjects:      Map<string, PropertySubject> = new Map();
    private readonly _subscriptions: Map<string, Subscription>    = new Map();

    public get dependencies(): Map<string, Reactor>
    {
        return this._dependencies;
    }

    public get observers(): Map<string, Observer>
    {
        return this._observers;
    }

    public get subjects(): Map<string, PropertySubject>
    {
        return this._subjects;
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
                for (const [key, observer] of this.observers)
                {
                    observer.notify(value[key]);
                }

                for (const [key, subject] of this.subjects)
                {
                    subject.notify(value[key]);
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

            if (this.subjects.has(key))
            {
                this.subjects.get(key)!.notify(value);
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