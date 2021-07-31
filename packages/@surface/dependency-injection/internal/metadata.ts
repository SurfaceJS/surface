import type { Constructor } from "@surface/core";
import type Container       from "./container.js";

const METADATA = Symbol("dependency-injection:static-metadata");

export default class StaticMetadata
{
    public readonly parameters: (string | symbol | Constructor)[]                  = [];
    public readonly properties: [string | symbol, string | symbol | Constructor][] = [];
    public provider?: Container;

    public static from(target: Function): StaticMetadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: new StaticMetadata() });
        }
        else if (!target.hasOwnProperty(METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: (Reflect.get(target, METADATA) as StaticMetadata).inherit() });
        }

        return Reflect.get(target, METADATA) as StaticMetadata;
    }

    public inherit(): StaticMetadata
    {
        const clone = new StaticMetadata();

        clone.properties.push(...this.properties);

        return clone;
    }
}