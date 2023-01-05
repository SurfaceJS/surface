/* eslint-disable @typescript-eslint/no-explicit-any */
import StaticMetadata from "../metadata.js";
import type { Key }   from "../types/index.js";

/**
 * Injects dependencies resolved by active container.
 * Can be used on constructor parameters or properties.
 * Note that when using property injection, injection occurs after instantiation. Therefore the values will not be available in the constructor.
 * @param key Key used to resolve instance.
 **/
export default function inject(key: Key): any
{
    return (...args: [object, string | symbol, number] | [object, string | symbol, PropertyDescriptor]) =>
    {
        const [target, propertyKey] = args;

        const constructor = typeof target == "function" ? target : target.constructor;

        const metadata = StaticMetadata.from(constructor);

        if (typeof args[2] == "number")
        {
            metadata.parameters[args[2]] = key;
        }
        else
        {
            metadata.properties.push([propertyKey, key]);
        }
    };
}
