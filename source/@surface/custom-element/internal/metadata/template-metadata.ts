import { Action }            from "@surface/core";
import IInjectDirective      from "../interfaces/inject-directive";
import { TEMPLATE_METADATA } from "../symbols";
import { Scope }             from "../types";

type Factory   = (scope: Scope, host: Node, template: HTMLTemplateElement, injectDirective?: IInjectDirective) => void;
type Injection = { scope: Scope, template: HTMLTemplateElement, directive: IInjectDirective };

type Target = object & { [TEMPLATE_METADATA]?: TemplateMetadata };

export default class TemplateMetadata
{
    public defaults:   Map<string, Action>    = new Map();
    public injections: Map<string, Injection> = new Map();
    public injectors:  Map<string, Factory>   = new Map();

    public static from(target: Target): TemplateMetadata
    {
        return target[TEMPLATE_METADATA] = target[TEMPLATE_METADATA] ?? new TemplateMetadata();
    }

    public static set(target: Target, metadata: TemplateMetadata): void
    {
        target[TEMPLATE_METADATA] = metadata;
    }

    public merge(templateMetadata: TemplateMetadata): void
    {
        for (const [key, value] of templateMetadata.injections)
        {
            this.injections.set(key, value);
        }

        for (const [key, value] of templateMetadata.injectors)
        {
            this.injectors.set(key, value);
        }
    }
}