import { Constructor, DisposableMetadata, HookableMetadata, overrideProperty } from "@surface/core";
import Metadata                                                                from "./metadata";
import Reactive                                                                from "./reactive";

export function computed<T extends object>(...properties: (keyof T | string[])[]): <U extends T>(target: U, propertyKey: string, descriptor: PropertyDescriptor) => void
{
    return (target, propertyKey) =>
    {
        const initializer = (instance: object): void =>
        {
            Metadata.from(instance).computed.set(propertyKey, (properties as string[][]).map(x => Array.isArray(x) ? x : [x]));
        };

        HookableMetadata.from(target.constructor as Constructor).initializers.push(initializer);
    };
}

export function notify<T extends object>(...properties: (keyof T | string[])[]): <U extends T>(target: U, propertyKey: string, descriptor?: PropertyDescriptor) => void
{
    return (target, propertyKey, descriptor) =>
    {
        const initializer = (instance: object): void =>
        {
            const keys = properties.map(x => Array.isArray(x) ? x.join("\u{fffff}") : x) as string[];

            const action = (instance: object): void =>
            {
                const metadata = Metadata.from(instance);

                for (const key of keys)
                {
                    metadata.observers.get(key)?.notify();
                }
            };

            overrideProperty(instance, propertyKey, action, descriptor);
        };

        HookableMetadata.from(target.constructor as Constructor).initializers.push(initializer);
    };
}

export function observe<T extends object>(...properties: (keyof T | string)[]): <U extends T>(target: U, propertyKey: string, descriptor?: PropertyDescriptor) => void
{
    return (target, propertyKey) =>
    {
        const initializer = (instance: object): void =>
        {
            const disposableMetadata = DisposableMetadata.from(instance);
            const observer           = Reactive.from(instance, [propertyKey]);

            for (const property of properties)
            {
                const subscription = observer.subscribe(x => (Reflect.get(instance, property) as Function)(x));

                disposableMetadata.add({ dispose: () => subscription.unsubscribe() });
            }
        };

        HookableMetadata.from(target.constructor as Constructor).initializers.push(initializer);
    };
}