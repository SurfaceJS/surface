import type { Constructor }                     from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";
import Reactive                                 from "../reactive.js";

export default function observe(...properties: string[]): (target: object, propertyKey: string, descriptor?: PropertyDescriptor) => void
{
    return (target, propertyKey) =>
    {
        const finisher = (instance: object): void =>
        {
            const disposableMetadata = DisposableMetadata.from(instance);
            const observer           = Reactive.from(instance, [propertyKey]);

            for (const property of properties)
            {
                const subscription = observer.subscribe(x => (Reflect.get(instance, property) as Function)(x));

                disposableMetadata.add({ dispose: () => subscription.unsubscribe() });
            }
        };

        HookableMetadata.from(target.constructor as Constructor).finishers.push(finisher);
    };
}