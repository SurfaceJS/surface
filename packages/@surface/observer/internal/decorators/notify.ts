import type { Constructor }                     from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";
import Metadata                                 from "../metadata.js";
import Observer                                 from "../observer.js";

export default function notify<T extends object>(...properties: (keyof T | string[])[]): <U extends T>(target: U, propertyKey: string) => void
{
    return (target, propertyKey) =>
    {
        const finisher = (instance: object): void =>
        {
            const keys     = properties.map(x => Array.isArray(x) ? x.join("\u{fffff}") : x) as string[];
            const metadata = Metadata.from(instance);

            const action = (): void =>
            {
                for (const key of keys)
                {
                    metadata.observers.get(key)?.notify();
                }
            };

            const subscription = Observer.observe(instance, [propertyKey]).subscribe(action);

            DisposableMetadata.from(instance).add({ dispose: () => subscription.unsubscribe() });
        };

        HookableMetadata.from(target.constructor as Constructor).finishers.push(finisher);
    };
}
