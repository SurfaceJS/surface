import type { Constructor, Delegate } from "../types";

const HOOKABLE_METADATA = Symbol("core:hookable-metadata");

export default class HookableMetadata<T extends Constructor>
{
    public readonly finishers:    Delegate<[InstanceType<T>]>[] = [];
    public readonly initializers: Delegate<[InstanceType<T>]>[] = [];

    public hooked: boolean = false;

    public static from<T extends Constructor>(target: T): HookableMetadata<T>
    {
        if (!Reflect.has(target, HOOKABLE_METADATA))
        {
            Reflect.defineProperty(target, HOOKABLE_METADATA, { value: new HookableMetadata() });
        }
        else if (!target.hasOwnProperty(HOOKABLE_METADATA))
        {
            Reflect.defineProperty(target, HOOKABLE_METADATA, { value: (Reflect.get(target, HOOKABLE_METADATA) as HookableMetadata<T>).clone() });
        }

        return Reflect.get(target, HOOKABLE_METADATA) as HookableMetadata<T>;
    }

    public clone(): HookableMetadata<T>
    {
        const metadata = new HookableMetadata<T>();

        metadata.finishers.push(...this.finishers);
        metadata.initializers.push(...this.initializers);

        return metadata;
    }

    public finish(instance: InstanceType<T>): void
    {
        this.finishers.forEach(finisher => finisher(instance));
    }

    public initialize(instance: InstanceType<T>): void
    {
        this.initializers.forEach(initializer => initializer(instance));
    }
}