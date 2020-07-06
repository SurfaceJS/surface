import { Constructor } from "@surface/core";
import Container       from "./internal/container";
import StaticMetadata  from "./internal/metadata";

// tslint:disable-next-line:no-any
export function inject(key: string|symbol|Constructor): any
{
    return (...args: [object, string|symbol, number]|[object, string|symbol, PropertyDescriptor]) =>
    {
        const [target, propertyKey] = args;

        const constructor = typeof target == "function" ? target : target.constructor;

        const metadata = StaticMetadata.from(constructor);

        const parameterIndexOrdescriptor = args[2];

        if (typeof parameterIndexOrdescriptor == "number")
        {
            metadata.parameters.push(key);
        }
        else
        {
            metadata.properties.push([propertyKey, key]);
        }
    };
}

export default Container;