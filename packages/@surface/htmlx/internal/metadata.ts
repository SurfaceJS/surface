import type { Delegate }     from "@surface/core";
import type InjectionContext from "./types/injection-context";

export const METADATA = Symbol("htmlx:metadata");

export default class Metadata
{
    public defaults:     Map<string, Delegate>                     = new Map();
    public injections:   Map<string, InjectionContext>             = new Map();
    public placeholders: Map<string, Delegate<[InjectionContext]>> = new Map();

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }
}