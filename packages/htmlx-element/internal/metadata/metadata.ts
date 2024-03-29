import type { Activator } from "@surface/htmlx";

export const METADATA = Symbol("htmlx-element:metadata");

export default class Metadata
{
    public isPropagatingCallback: boolean = false;
    public reflectingAttribute:   Set<string> = new Set();

    public activator?: Activator;

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }
}