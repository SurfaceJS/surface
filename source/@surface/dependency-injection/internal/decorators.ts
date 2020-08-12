import { Constructor, overrideConstructor } from "@surface/core";
import Container                            from "./container";
import StaticMetadata                       from "./metadata";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function inject(key: string | symbol | Constructor): any
{
    return (...args: [object, string | symbol, number] | [object, string | symbol, PropertyDescriptor]) =>
    {
        const [target, propertyKey] = args;

        const constructor = typeof target == "function" ? target : target.constructor;

        const metadata = StaticMetadata.from(constructor);

        if (typeof args[2] == "number")
        {
            metadata.parameters.push(key);
        }
        else
        {
            metadata.properties.push([propertyKey, key]);
        }
    };
}

export function injectable(container: Container): <T extends Constructor>(target: T) => T
{
    return <T extends Constructor>(target: T) =>
        overrideConstructor(target, x => container.inject(x));
}