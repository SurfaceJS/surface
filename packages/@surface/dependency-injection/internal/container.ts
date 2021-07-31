import type { Constructor, IDisposable } from "@surface/core";
import { typeGuard }                     from "@surface/core";
import StaticMetadata                    from "./metadata.js";
import type { Factory, Key }             from "./types";

/** Container used to dependency injection. */
export default class Container implements IDisposable
{
    private readonly cache:      Map<Key, Partial<IDisposable>> = new Map();
    private readonly scopeCache: Map<Key, Partial<IDisposable>> = new Map();
    private readonly registries: Map<Key, Function>             = new Map();
    private readonly scoped:     Set<Key>                       = new Set();
    private readonly singletons: Set<Key>                       = new Set();
    private readonly stack:      Set<Key>                       = new Set();

    private depth: number = 0;

    public constructor(private parent: Container | null = null)
    { }

    private getCacheEntry(key: Key, scoped: boolean): Partial<IDisposable> | undefined
    {
        if (scoped)
        {
            return this.scopeCache.get(key) ?? this.parent?.getCacheEntry(key, scoped);
        }

        return this.cache.get(key) ?? this.parent?.getCacheEntry(key, scoped);
    }

    private getRoot(): Container
    {
        return this.parent?.getRoot() ?? this;
    }

    private resolveInternal(key: Key, requirer: Container): object
    {
        const isScoped    = this.scoped.has(key);
        const isSingleton = this.singletons.has(key);

        requirer.depth++;

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

                instance = this.inject(!entry.prototype ? (entry as Factory)(this) : entry);

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
                instance = this.parent.resolveInternal(key, requirer);
            }
        }

        if (!instance)
        {
            throw new Error(`Cannot resolve entry for the key ${typeof key == "function" ? key.name : key.toString()}`);
        }

        requirer.depth--;

        if (requirer.depth == 0)
        {
            requirer.disposeScope();
        }

        return instance;
    }

    private disposeScope(): void
    {
        for (const instance of this.scopeCache.values())
        {
            instance.dispose?.();
        }

        this.scopeCache.clear();
        this.parent?.disposeScope();
    }

    /** Disposes all cached instancies e clear all registrations */
    public dispose(): void
    {
        for (const instance of this.cache.values())
        {
            instance.dispose?.();
        }

        this.disposeScope();

        this.registries.clear();
        this.cache.clear();
        this.scoped.clear();
        this.singletons.clear();
    }

    /** Instantiate and inject constructor parameters and properties. */
    public inject<T extends Constructor>(target: T): InstanceType<T>;

    /** Inject properties on the provided instance. */
    public inject<T extends object>(target: T): T;
    public inject(target: Constructor | object): object
    {
        const constructor = typeof target == "function" ? target : target.constructor;

        const metadata = StaticMetadata.from(constructor);

        const active = metadata.provider ?? this;

        const root = metadata.provider?.getRoot();

        if (root)
        {
            root.parent = this;
        }

        const instance = typeof target == "function" ? Reflect.construct(target, metadata.parameters.map(x => active.resolveInternal(x, active))) : target;

        for (const [property, key] of metadata.properties)
        {
            instance[property] = active.resolveInternal(key, active);
        }

        if (root)
        {
            root.parent = null;
        }

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

    /**
     * Returns resolved dependency.
     * @param key Key used to resolve instance.
     **/
    public resolve<T>(key: Constructor<T>): T;
    public resolve(key: Key): object
    {
        return this.resolveInternal(key, this);
    }
}