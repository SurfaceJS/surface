/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/prefer-default-export */

import { Constructor } from "@surface/core";
import StaticMetadata  from "./metadata";

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