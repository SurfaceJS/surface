import type { Constructor, IDisposable } from "@surface/core";
import { typeGuard }                     from "@surface/core";
import type IScopedProvider              from "./interfaces/scoped-provider";
import StaticMetadata                    from "./metadata.js";
import type { Factory, Key }             from "./types";

/** Container used to dependency injection. */
class Container implements IDisposable
{
    protected readonly cache:      Map<Key, Partial<IDisposable>> = new Map();
    protected readonly scopeCache: Map<Key, Partial<IDisposable>> = new Map();
    protected readonly registries: Map<Key, Function>             = new Map();
    protected readonly scoped:     Set<Key>                       = new Set();
    protected readonly singletons: Set<Key>                       = new Set();
    protected readonly stack:      Set<Key>                       = new Set();

    // protected depth:     number  = 0;
    // protected resolving: boolean = false;

    public constructor(protected parent: Container | null = null)
    { }

    protected clearScope(): void
    {
        this.scopeCache.clear();
        this.parent?.clearScope();
    }

    protected *enumerateScopedCache(): Iterable<[Key, object]>
    {
        if (this.parent)
        {
            for (const entry of this.parent.enumerateScopedCache())
            {
                yield entry;
            }
        }

        for (const entry of this.scopeCache)
        {
            yield entry;
        }
    }

    protected getCacheEntry(key: Key, scoped: boolean): Partial<IDisposable> | undefined
    {
        if (scoped)
        {
            return this.scopeCache.get(key) ?? this.parent?.getCacheEntry(key, scoped);
        }

        return this.cache.get(key) ?? this.parent?.getCacheEntry(key, scoped);
    }

    protected getRoot(): Container
    {
        return this.parent?.getRoot() ?? this;
    }

    protected internalInject(target: Constructor | object): object
    {
        const constructor = typeof target == "function" ? target : target.constructor;

        const metadata = StaticMetadata.from(constructor);

        const active = metadata.provider ?? this;

        const root = metadata.provider?.getRoot();

        if (root)
        {
            root.parent = this;
        }

        const instance = typeof target == "function" ? Reflect.construct(target, metadata.parameters.map(x => active.internalResolve(x))) : target;

        for (const [property, key] of metadata.properties)
        {
            instance[property] = active.internalResolve(key);
        }

        if (root)
        {
            root.parent = null;
        }

        return instance;
    }

    protected internalResolve(key: Key): object
    {
        const isScoped    = this.scoped.has(key);
        const isSingleton = this.singletons.has(key);

        let instance: object | null = null;

        const cacheEntry = isScoped || isSingleton
            ? this.getCacheEntry(key, isScoped)
            : null;

        if (cacheEntry)
        {
            instance = cacheEntry;
        }
        else
        {
            const entry = this.registries.get(key);

            if (entry)
            {
                if (this.stack.has(key))
                {
                    throw new Error(`Circularity dependency to the key: ${typeof key == "function" ? `[function ${key.name}]` : key.toString()}`);
                }

                this.stack.add(key);

                instance = this.internalInject(!entry.prototype ? (entry as Factory)(this) : entry);

                this.stack.delete(key);

                if (isScoped)
                {
                    this.scopeCache.set(key, instance as object);
                }

                if (isSingleton)
                {
                    this.cache.set(key, instance as object);
                }
            }
            else if (this.parent)
            {
                instance = this.parent.internalResolve(key);
            }
        }

        if (!instance)
        {
            throw new Error(`Cannot resolve entry for the key ${typeof key == "function" ? key.name : key.toString()}`);
        }

        return instance;
    }

    /** Disposes all cached instancies e clear all registrations */
    public dispose(): void
    {
        for (const instance of this.cache.values())
        {
            instance.dispose?.();
        }

        this.registries.clear();
        this.cache.clear();
        this.scoped.clear();
        this.singletons.clear();
    }

    /** Creates a scoped provider that will cache all scoped dependencies. */
    public createScope(): IScopedProvider
    {
        return new ScopedProvider(this);
    }

    /** Instantiate and inject constructor parameters and properties. */
    public inject<T extends Constructor>(target: T): InstanceType<T>;

    /** Inject properties on the provided instance. */
    public inject<T extends object>(target: T): T;
    public inject(target: Constructor | object): object
    {
        const instance = this.internalInject(target);

        this.clearScope();

        return instance;
    }

    /** Registers a scoped dependency. */
    public registerScoped(constructor: Constructor): Container;

    /**
     * Registers a scoped dependency.
     * @param key Key used to resolve dependency.
     * @param factory Factory used to create the dependency.
     **/
    public registerScoped(key: Key, factory: Factory): Container;

    /**
     * Registers a scoped dependency.
     * @param key Key used to resolve dependency.
     * @param constructor Dependency constructor.
     **/
    public registerScoped(key: Key, constructor: Constructor): Container;
    public registerScoped(...args: [Constructor] | [Key, Constructor | Factory]): Container
    {
        const [key, value] = args.length == 1
            ? [args[0], args[0]]
            : args;

        this.registries.set(key, value);
        this.scoped.add(key);

        return this;
    }

    /** Registers a singleton dependency. */
    public registerSingleton(constructor: Constructor): Container;

    /**
     * Registers a singleton dependency.
     * @param key Key used to resolve dependency.
     * @param factory Factory used to create the dependency.
     **/
    public registerSingleton(key: Key, factory: Factory): Container;

    /**
     * Registers a singleton dependency.
     * @param key Key used to resolve dependency.
     * @param constructor Dependency constructor.
     **/
    public registerSingleton(key: Key, constructor: Constructor): Container;

    /**
     * Registers a singleton dependency.
     * @param key Key used to resolve dependency.
     * @param instance Dependency to be stored.
     **/
    public registerSingleton(key: Key, instance: object): Container;
    public registerSingleton(...args: [Constructor] | [Key, object] | [Key, Function]): Container
    {
        const [key, factory, instance] = args.length == 1
            ? [args[0], args[0], null]
            : typeGuard<[Key, Function]>(args, typeof args[1] == "function")
                ? [...args, null]
                : [args[0], null, args[1]];

        if (instance)
        {
            this.cache.set(key, instance);
        }

        if (factory)
        {
            this.registries.set(key, factory);
        }

        this.singletons.add(key);

        return this;
    }

    /** Registers a transient dependency. */
    public registerTransient(constructor: Constructor): Container;

    /**
     * Registers a transient dependency.
     * @param key Key used to resolve dependency.
     * @param factory Factory used to create the dependency.
     **/
    public registerTransient(key: Key, factory: Factory): Container;

    /**
     * Registers a singleton dependency.
     * @param key Key used to resolve dependency.
     * @param constructor Dependency constructor.
     **/
    public registerTransient(key: Key, constructor: Constructor): Container;
    public registerTransient(...args: [Constructor] | [Key, Constructor | Factory]): Container
    {
        const [key, value] = args.length == 1
            ? [args[0], args[0]]
            : args;

        this.registries.set(key, value);

        return this;
    }

    /**
     * Returns resolved dependency.
     * @param key Key used to resolve instance.
     **/
    public resolve<T extends object = object>(key: string | symbol): T;
    public resolve<T>(key: Constructor<T>): T;
    public resolve(key: Key): object;
    public resolve(key: Key): object
    {
        return this.internalResolve(key);
    }
}

class ScopedProvider extends Container implements IScopedProvider
{
    private factorize(factory: () => object): object
    {
        const instance = factory();

        for (const [key, instance] of this.enumerateScopedCache())
        {
            this.cache.set(key, instance);
        }

        this.clearScope();

        return instance;
    }

    public override inject(target: Constructor | object): object
    {
        return this.factorize(() => super.internalInject(target) as object);
    }

    public override resolve(key: Key): object
    {
        const entry = this.cache.get(key);

        if (entry)
        {
            return entry;
        }

        return this.factorize(() => super.internalResolve(key));
    }
}

export default Container;