import { Constructor } from "@surface/core";
import Container       from "./internal/container";
import IInjections     from "./internal/interfaces/injections";
import { INJECTIONS }  from "./internal/symbols";

// tslint:disable-next-line:no-any
export function inject(key: string|symbol|Constructor): any
{
    return (...args: [object, string|symbol, number]|[object, string|symbol, PropertyDescriptor]) =>
    {
        const [target, propertyKey] = args;

        const constructor = (typeof target == "function" ? target : target.constructor) as Function & { [INJECTIONS]?: IInjections };

        const injections = constructor[INJECTIONS] = constructor[INJECTIONS] || { parameters: [], properties: [] };

        const parameterIndexOrdescriptor = args[2];

        if (typeof parameterIndexOrdescriptor == "number")
        {
            injections.parameters.push(key);
        }
        else
        {
            injections.properties.push([propertyKey, key]);
        }
    };
}

export default Container;