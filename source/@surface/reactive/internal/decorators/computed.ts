import { Constructor, HookableMetadata } from "@surface/core";
import Metadata                          from "../metadata";

export default function computed<T extends object>(...properties: (keyof T | string[])[]): <U extends T>(target: U, propertyKey: string, descriptor: PropertyDescriptor) => void
{
    return (target, propertyKey) =>
    {
        const finisher = (instance: object): void =>
        {
            Metadata.from(instance).computed.set(propertyKey, (properties as string[][]).map(x => Array.isArray(x) ? x : [x]));
        };

        HookableMetadata.from(target.constructor as Constructor).finishers.push(finisher);
    };
}
