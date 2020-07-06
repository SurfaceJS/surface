import { typeGuard, Constructor, Indexer, Nullable } from "@surface/core";
import StaticMetadata                                from "./metadata";

type Factory = (container: Container) => object;

export default class Container
{
    private readonly registries: Map<string|symbol|Constructor, Function> = new Map();
    private readonly resolved:   Map<string|symbol|Constructor, object>   = new Map();

    private resolveConstructorInjections(constructor: Function, parameters: Array<string|symbol|Constructor>, newInstance?: boolean): object
    {
        return Reflect.construct(constructor, parameters.map(key => this.get(key, newInstance)));
    }

    private resolvePropertiesInjections(instance: object, properties: Array<[string, string]>, newInstance?: boolean): void
    {
        for (const [property, key] of properties)
        {
            (instance as Indexer)[property] = this.get(key, newInstance);
        }
    }

    public register(entry: Constructor): Container;
    public register(key: string|symbol, constructor: Constructor): Container;
    public register(key: string|symbol, factory: Factory): Container;
    public register(...args: [Constructor]|[string|symbol, Constructor|Factory]): Container
    {
        const [key, value] = args.length == 2 ? args : [args[0], args[0]];

        this.registries.set(key, value);

        return this;
    }

    public get<T extends object = object>(key: string|symbol, newInstance?: boolean, cascade?: boolean): T;
    public get<T extends Constructor>(key: T, newInstance?: boolean, cascade?: boolean): InstanceType<T>;
    public get<T extends object = object>(key: string|symbol|Constructor, newInstance?: boolean, cascade?: boolean): T;
    public get(key: string|symbol|Constructor, newInstance?: boolean, cascade?: boolean): object
    {
        let instance: object | undefined;

        if (!newInstance && (instance = this.resolved.get(key)))
        {
            return instance;
        }
        else
        {
            const entry: Nullable<Function> = this.registries.get(key);

            if (entry)
            {
                const metadata = StaticMetadata.from(entry);

                const instance = typeGuard<Factory>(entry, !entry.prototype)
                    ? entry(this)
                    : this.resolveConstructorInjections(entry, metadata ? metadata.parameters : [], newInstance && cascade);

                if (metadata && metadata.properties.length > 0)
                {
                    this.resolvePropertiesInjections(instance as Indexer, metadata.properties as Array<[string, string]>, newInstance && cascade);
                }

                this.resolved.set(key, instance);

                return instance;
            }

            throw new Error(`Cannot resolve entry for the key ${typeof key == "function" ? key.name : key.toString()}`);
        }
    }

    public resolveConstructor<T extends Constructor>(constructor: T): InstanceType<T>
    {
        const metadata = StaticMetadata.from(constructor);

        const instance = this.resolveConstructorInjections(constructor, metadata.parameters);

        this.resolvePropertiesInjections(instance, metadata.properties as Array<[string, string]>);

        return instance as InstanceType<T>;
    }

    public resolveInstance<T extends object>(instance: T): T
    {
        const metadata = StaticMetadata.from(instance.constructor);

        this.resolvePropertiesInjections(instance, metadata.properties as Array<[string, string]>);

        return instance;
    }
}

// Todo - Implement
// import { Constructor, Nullable } from "../../types";
// import IInjections               from "./internal/interfaces/injections";
// import { INJECTIONS }            from "./internal/symbols";

// type InjectableConstructor = Function & { [INJECTIONS]?: IInjections };
// type Factory<T = object>   = (container: Omit<Container, "register">) => T;
// type Key<T = object>       = string|symbol|Constructor<T>;

// export default class Container
// {
//     private readonly registries: Map<Key, Function> = new Map();
//     private readonly resolved:   Map<Key, object>   = new Map();
//     private readonly singletons: Set<Key>           = new Set();
//     private readonly stack:      Set<Key>           = new Set();

//     public registerSingleton(instance: object): Container;
//     public registerSingleton(constructor: Constructor): Container;
//     public registerSingleton(key: Key, constructor: Constructor): Container;
//     public registerSingleton<T>(key: Key<T>, factory: Factory<T>): Container;
//     public registerSingleton(...args: [object]|[Key, Constructor|Factory]): Container
//     {
//         const [key, value] = args.length == 1
//             ? typeof args[0] == "function"
//                 ? [args[0] as Key, args[0]]
//                 : [args[0].constructor as Key, args[0].constructor]
//             : args;

//         if (args.length == 1 && typeof args[0] != "function")
//         {
//             this.resolved.set(key, args[0]);
//         }

//         this.registries.set(key, value);

//         this.singletons.add(key);

//         return this;
//     }

//     public registerTransient(constructor: Constructor): Container;
//     public registerTransient(key: Key, constructor: Constructor): Container;
//     public registerTransient<T>(key: Key|Constructor<T>, factory: Factory<T>): Container;
//     public registerTransient(...args: [Constructor]|[Key, Constructor|Factory]): Container
//     {
//         const [key, value] = args.length == 1 ?
//                 [args[0] as Key, args[0]]
//                     : args;

//         this.registries.set(key, value);

//         return this;
//     }

//     public resolve<T extends object = object>(key: string|symbol): T;
//     public resolve<T>(key: Constructor<T>): T;
//     public resolve(key: Key): object;
//     public resolve(key: Key): object
//     {
//         const isSingleton = this.singletons.has(key);

//         if (isSingleton && this.resolved.has(key))
//         {
//             return this.resolved.get(key)!;
//         }
//         else
//         {
//             const entry: Nullable<InjectableConstructor> = this.registries.get(key);

//             if (entry)
//             {
//                 if (this.stack.has(key))
//                 {
//                     throw new Error(`Circularity dependency to the key ${typeof key == "function" ? key.name : key.toString()}`);
//                 }

//                 this.stack.add(key);

//                 const instance = this.inject(!entry.prototype ? (entry as Factory)(this) : entry);

//                 this.stack.delete(key);

//                 if (isSingleton)
//                 {
//                     this.resolved.set(key, instance);
//                 }

//                 return instance;
//             }

//             throw new Error(`Cannot resolve entry for the key ${typeof key == "function" ? key.name : key.toString()}`);
//         }
//     }

//     public inject<T extends Constructor>(constructor: T): InstanceType<T>;
//     public inject<T extends object>(instance: T): T;
//     public inject(target: Constructor|object): object
//     {
//         const constructor = typeof target == "function" ? target : target.constructor;

//         const metadata = StaticMetadata.from(constructor);

//         const instance = typeof target == "function" ? Reflect.construct(target, metadata.parameters.map(x => this.resolve(x))) : target;

//         for (const [property, key] of metadata.properties)
//         {
//             instance[property] = this.resolve(key);
//         }

//         return instance;
//     }
// }