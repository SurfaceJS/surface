import { Constructor }         from "@surface/core";
import { overrideConstructor } from "@surface/core/common/object";
import Reactive                from ".";
import StaticMetadata          from "./internal/static-metadata";

export function observe<T extends object>(property: keyof T): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const metadata = StaticMetadata.from(target.constructor);

        const action = (instance: object) =>
            Reactive.observe(instance, property as string).observer.subscribe({ notify: x => (instance as Record<string, Function>)[propertyKey](x) });

        metadata.actions.push(action as (instance: object) => void);
    };
}

export function observable<T extends Constructor>(target: T): T
{
    const metadata = StaticMetadata.from(target);

    const action = (instance: InstanceType<T>) => (metadata.actions.forEach(x => x(instance)), instance);

    return overrideConstructor(target, action);
}

export function notify<T extends object>(...properties: Array<keyof T>): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const action = (instance: object) =>
        {
            for (const property of properties)
            {
                Reactive.observe(instance, propertyKey).observer.subscribe({ notify: () => Reactive.notify(instance, property as string)});
            }
        };

        StaticMetadata.from(target.constructor).actions.push(action);
    };
}