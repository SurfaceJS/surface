import { Delegate }          from "@surface/core";
import { TEMPLATE_METADATA } from "../symbols";
import { Injection }         from "../types";

type Target = object & { [TEMPLATE_METADATA]?: TemplateMetadata };

export default class TemplateMetadata
{
    public defaults:     Map<string, Delegate>              = new Map();
    public injections:   Map<string, Injection>             = new Map();
    public placeholders: Map<string, Delegate<[Injection]>> = new Map();

    public static from(target: Target): TemplateMetadata
    {
        return target[TEMPLATE_METADATA] = target[TEMPLATE_METADATA] ?? new TemplateMetadata();
    }
}