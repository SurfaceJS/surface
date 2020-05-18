import { Constructor, Indexer, Nullable } from "@surface/core";
import IInjections                        from "./interfaces/injections";
import { INJECTIONS }                     from "./symbols";

type Factory               = (container: Container) => object;
type InjectableConstructor = Function & { [INJECTIONS]?: IInjections };

export default class Container
{
    private readonly registries: Map<string|symbol|Constructor, Function> = new Map();
    private readonly resolved:   Map<string|symbol|Constructor, object>   = new Map();

    private resolveConstructorInjections(constructor: Function, parameters: Array<string|symbol|Constructor>, newInstance?: boolean): object
    {
        return Reflect.construct(constructor, parameters.map(key => this.resolve(key, newInstance)));
    }

    private resolvePropertiesInjections(instance: object, properties: Array<[string, string]>, newInstance?: boolean): void;
    private resolvePropertiesInjections(instance: Indexer, properties: Array<[string, string]>, newInstance?: boolean): void
    {
        for (const [property, key] of properties)
        {
            instance[property] = this.resolve(key, newInstance);
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

    public resolve<T extends object = object>(key: string|symbol, newInstance?: boolean, cascade?: boolean): T;
    public resolve<T extends Constructor>(key: T, newInstance?: boolean, cascade?: boolean): InstanceType<T>;
    public resolve(key: string|symbol|Constructor, newInstance?: boolean, cascade?: boolean): object;
    public resolve(key: string|symbol|Constructor, newInstance?: boolean, cascade?: boolean): object
    {
        if (!newInstance && this.resolved.has(key))
        {
            return this.resolved.get(key)!;
        }
        else
        {
            const entry: Nullable<InjectableConstructor> = this.registries.get(key);

            if (entry)
            {
                const injections = entry[INJECTIONS];

                const instance = !entry.prototype ?
                    (entry as Factory)(this)
                    : this.resolveConstructorInjections(entry, injections ? injections.parameters : [], newInstance && cascade);

                if (injections && injections.properties.length > 0)
                {
                    this.resolvePropertiesInjections(instance as Indexer, injections.properties as Array<[string, string]>, newInstance && cascade);
                }

                this.resolved.set(key, instance);

                return instance;
            }

            throw new Error(`Cannot resolve entry for the key ${typeof key == "function" ? key.name : key.toString()}`);
        }
    }

    public resolveConstructor<T extends Constructor>(constructor: T): InstanceType<T>;
    public resolveConstructor(constructor: InjectableConstructor): object
    {
        const injections = constructor[INJECTIONS];

        const instance = this.resolveConstructorInjections(constructor, injections ? injections.parameters : []);

        this.resolvePropertiesInjections(instance, (injections ? injections.properties : []) as Array<[string, string]>);

        return instance;
    }

    public resolveInstance<T extends object>(instance: T): T
    {
        const constructor = instance.constructor as InjectableConstructor;

        const injections = constructor[INJECTIONS];

        this.resolvePropertiesInjections(instance, (injections ? injections.properties : []) as Array<[string, string]>);

        return instance;
    }
}