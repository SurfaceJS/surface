import { Indexer }      from "@surface/core";
import Observer         from "./observer";
import PropertyObserver from "./property-observer";
import { REACTOR }      from "./symbols";

export type Monitored<T = Indexer> = T & { [REACTOR]?: Reactor<T> };

export default class Reactor<TTarget extends Indexer = Indexer>
{
    private readonly _dependencies:      Map<keyof TTarget, Reactor>                                  = new Map();
    private readonly _observers:         Map<keyof TTarget, Observer<TTarget[keyof TTarget]>>         = new Map();
    private readonly _propertyObservers: Map<keyof TTarget, PropertyObserver<TTarget, keyof TTarget>> = new Map();
    private readonly _registries:        Set<Reactor<TTarget>>                                        = new Set();

    private target: Monitored<TTarget>;

    public get dependencies(): Map<keyof TTarget, Reactor>
    {
        return this._dependencies;
    }

    public get observers(): Map<keyof TTarget, Observer<TTarget[keyof TTarget]>>
    {
        return this._observers;
    }

    public get propertyObservers(): Map<keyof TTarget, PropertyObserver<TTarget, keyof TTarget>>
    {
        return this._propertyObservers;
    }

    public get registries(): Set<Reactor<TTarget>>
    {
        return this._registries;
    }

    public constructor(target: TTarget)
    {
        this.target          = target;
        this.target[REACTOR] = this;
    }

    public notify(key?: keyof TTarget): void
    {
        if (key)
        {
            if (this.observers.has(key))
            {
                this.observers.get(key)!.notify(this.target[key]);
            }

            for (const registry of this.registries.values())
            {
                registry.notify(key);
            }
        }
        else
        {
            for (const dependency of this.dependencies.values())
            {
                dependency.notify();
            }

            for (const registry of this.registries.values())
            {
                registry.notify();
            }

            for (const [key, observer] of this.observers)
            {
                observer.notify(this.target[key]);
            }
        }
    }

    public register(reactor: Reactor<TTarget>): void
    {
        if (reactor != this)
        {
            for (const [key, dependency] of reactor.dependencies)
            {
                if (this.dependencies.has(key))
                {
                    this.dependencies.get(key)!.register(dependency);
                }
                else
                {
                    const value = this.target[key] as Monitored;

                    if (!value[REACTOR])
                    {
                        value[REACTOR] = new Reactor(value);
                    }

                    value[REACTOR]!.register(dependency);

                    this.dependencies.set(key, value[REACTOR]!);
                }
            }

            this.registries.add(reactor);
        }
    }

    public unregister(reactor: Reactor<TTarget>): void
    {
        if (this.registries.delete(reactor))
        {
            for (const [key, dependency] of reactor.dependencies)
            {
                if (this.dependencies.has(key))
                {
                    this.dependencies.get(key)!.unregister(dependency);
                }
            }
        }
        else
        {
            throw new Error("reactor not subscribed");
        }
    }

    public update(target: TTarget): void
    {
        this.target = target;

        for (const registry of this.registries)
        {
            registry.update(target);
        }

        for (const [key, dependency] of this.dependencies)
        {
            dependency.update(this.target[key] as Indexer);
        }
    }
}