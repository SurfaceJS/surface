import { HOOKABLE_METADATA } from "../symbols";
import { Constructor, Delegate } from "../types";

export default class HookableMetadata<T extends Constructor>
{
    public readonly initializers: Delegate<[InstanceType<T>]>[] = [];
    public readonly finishers:    Delegate<[InstanceType<T>]>[] = [];

    public hooked: boolean = false;

    public static from<T extends Constructor>(target: T): HookableMetadata<T>
    {
        if (!Reflect.has(target, HOOKABLE_METADATA))
        {
            Object.defineProperty(target, HOOKABLE_METADATA, { configurable: true, enumerable: false, value: new HookableMetadata<T>() });
        }

        return Reflect.get(target, HOOKABLE_METADATA)!;
    }

    public static of<T extends Constructor>(target: T): HookableMetadata<T> | undefined
    {
        return Reflect.get(target, HOOKABLE_METADATA)!;
    }

    public initialize(instance: InstanceType<T>): void
    {
        this.initializers.forEach(initializer => initializer(instance));
    }

    public finish(instance: InstanceType<T>): void
    {
        this.finishers.forEach(finisher => finisher(instance));
    }
}