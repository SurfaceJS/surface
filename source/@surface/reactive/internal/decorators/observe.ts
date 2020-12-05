import { Constructor, DisposableMetadata, HookableMetadata } from "@surface/core";
import Reactive                                                                from "../reactive";

export default function observe<T extends object>(...properties: (keyof T | string)[]): <U extends T>(target: U, propertyKey: string, descriptor?: PropertyDescriptor) => void
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