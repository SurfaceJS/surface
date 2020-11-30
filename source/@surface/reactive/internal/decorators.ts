import { overrideProperty } from "@surface/core";
import Metadata             from "./metadata";

export function computed<T extends object>(...properties: (keyof T | string[])[]): <U extends T>(target: U, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor
{
    return (target, propertyKey, descriptor) =>
    {
        Metadata.from(target).computed.set(propertyKey, (properties as string[][]).map(x => Array.isArray(x) ? x : [x]));

        return descriptor;
    };
}

export function notify<T extends object>(...properties: (keyof T | string[])[]): <U extends T>(target: U, propertyKey: string, descriptor?: PropertyDescriptor) => void
{
    return (target, propertyKey, descriptor) =>
    {
        const keys = properties.map(x => Array.isArray(x) ? x.join("\u{fffff}") : x) as string[];

        const action = (instance: object): void =>
        {
            const metadata = Metadata.of(instance);

            if (metadata)
            {
                for (const key of keys)
                {
                    metadata.observers.get(key)?.notify();
                }
            }
        };

        overrideProperty(target, propertyKey, action, descriptor);

        return descriptor;
    };
}