import type { Delegate }     from "@surface/core";
import type InjectionContext from "../types/injection-context";

export const TEMPLATE_METADATA  = Symbol("custom-element:template-metadata");

export default class TemplateMetadata
{
    public defaults:     Map<string, Delegate>                     = new Map();
    public injections:   Map<string, InjectionContext>             = new Map();
    public placeholders: Map<string, Delegate<[InjectionContext]>> = new Map();

    public static from(target: object): TemplateMetadata
    {
        if (!Reflect.has(target, TEMPLATE_METADATA))
        {
            Reflect.defineProperty(target, TEMPLATE_METADATA, { configurable: false, enumerable: false, value: new TemplateMetadata() });
        }

        return Reflect.get(target, TEMPLATE_METADATA);
    }
}