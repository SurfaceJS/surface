import { Constructor, typeGuard } from "@surface/core";
import StaticMetadata             from "./metadata";

type Factory     = (container: Pick<Container, "resolve" | "inject">) => object;
type Key         = string | symbol | Constructor;
type Instance<T> = T extends Function ? never : T;

export default class Container
{
    private readonly registries: Map<Key, Function> = new Map();
    private readonly resolved:   Map<Key, object>   = new Map();
    private readonly singletons: Set<Key>           = new Set();
    private readonly stack:      Set<Key>           = new Set();

    public static merge(left: Container, right: Container): Container
    {
        const container = new Container();

        left.registries.forEach((value, key) => container.registries.set(key, value));
        left.resolved.forEach((value, key) => container.resolved.set(key, value));
        left.singletons.forEach(key => container.singletons.add(key));

        right.registries.forEach((value, key) => container.registries.set(key, value));
        right.resolved.forEach((value, key) => container.resolved.set(key, value));
        right.singletons.forEach(key => container.singletons.add(key));

        return container;
    }

    public registerSingleton(constructor: Constructor): Container;
    public registerSingleton(key: Key, factory: Factory): Container;
    public registerSingleton(key: Key, constructor: Constructor): Container;
    public registerSingleton<T>(key: Key, instance: Instance<T>): Container;
    public registerSingleton(...args: [Constructor] | [Key, object] | [Key, Function]): Container
    {
        const [key, factory, instance] = args.length == 1
            ? [args[0], args[0], null]
            : typeGuard<[Key, Function]>(args, typeof args[1] == "function")
                ? [...args, null]
                : [args[0], null, args[1]];

        if (instance)
        {
            this.resolved.set(key, instance);
        }

        if (factory)
        {
            this.registries.set(key, factory);
        }

        this.singletons.add(key);

        return this;
    }

    public registerTransient(constructor: Constructor): Container;
    public registerTransient(key: Key, constructor: Constructor): Container;
    public registerTransient(key: Key | Constructor, factory: Factory): Container;
    public registerTransient(...args: [Constructor] | [Key, Constructor | Factory]): Container
    {
        const [key, value] = args.length == 1
            ? [args[0], args[0]]
            : args;

        this.registries.set(key, value);

        return this;
    }

    public resolve<T extends object = object>(key: string | symbol): T;
    public resolve<T>(key: Constructor<T>): T;
    public resolve(key: Key): object;
    public resolve(key: Key): object
    {
        const isSingleton = this.singletons.has(key);

        if (isSingleton && this.resolved.has(key))
        {
            return this.resolved.get(key)!;
        }

        const entry = this.registries.get(key);

        if (entry)
        {
            if (this.stack.has(key))
            {
                throw new Error(`Circularity dependency to the key: ${typeof key == "function" ? `[function ${key.name}]` : key.toString()}`);
            }

            this.stack.add(key);

            const instance = this.inject(!entry.prototype ? (entry as Factory)(this) : entry);

            this.stack.delete(key);

            if (isSingleton)
            {
                this.resolved.set(key, instance);
            }

            return instance;
        }

        throw new Error(`Cannot resolve entry for the key ${typeof key == "function" ? key.name : key.toString()}`);
    }

    public inject<T extends Constructor>(constructor: T): InstanceType<T>;
    public inject<T extends object>(instance: T): T;
    public inject(target: Constructor | object): object
    {
        const constructor = typeof target == "function" ? target : target.constructor;

        const metadata = StaticMetadata.from(constructor);

        const instance = typeof target == "function" ? Reflect.construct(target, metadata.parameters.map(x => this.resolve(x))) : target;

        for (const [property, key] of metadata.properties)
        {
            instance[property] = this.resolve(key);
        }

        return instance;
    }
}