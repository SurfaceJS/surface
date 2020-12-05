import { Delegate }  from "@surface/core";
import { Injection } from "../types";

export const TEMPLATE_METADATA  = Symbol("custom-element:template-metadata");

export default class TemplateMetadata
{
    public defaults:     Map<string, Delegate>              = new Map();
    public injections:   Map<string, Injection>             = new Map();
    public placeholders: Map<string, Delegate<[Injection]>> = new Map();

    public static from(target: object): TemplateMetadata
    {
        if (!Reflect.has(target, TEMPLATE_METADATA))
        {
            Reflect.defineProperty(target, TEMPLATE_METADATA, { value: new TemplateMetadata() });
        }

        return Reflect.get(target, TEMPLATE_METADATA);
    }
}