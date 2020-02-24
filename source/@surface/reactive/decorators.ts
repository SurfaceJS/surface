import { Constructor }         from "@surface/core";
import { injectToConstructor } from "@surface/core/common/object";
import Reactive                from ".";
import StaticMetadata          from "./internal/static-metadata";

export function observe<T extends object>(property: keyof T): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        if (typeof target[propertyKey as keyof U] == "function")
        {
            const metadata = StaticMetadata.from(target.constructor);

            const action = (instance: object) =>
                Reactive.observe(instance, property as string)[1].subscribe({ notify: x => (instance as Record<string, Function>)[propertyKey](x) });

            metadata.actions.push(action as (instance: object) => void);
        }
    };
}

export function observable(target: Constructor): Constructor
{
    const metadata = StaticMetadata.from(target);

    const action = (instance: object) => (metadata.actions.forEach(x => x(instance)), instance);

    return injectToConstructor(target, action);
}