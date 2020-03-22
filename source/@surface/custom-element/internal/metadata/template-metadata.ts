import { Action }            from "@surface/core";
import IInjectStatement      from "../interfaces/inject-statement";
import { TEMPLATE_METADATA } from "../symbols";
import { Scope }             from "../types";

type DefaultFactory = (host: Node) => void;
type Factory        = (host: Node, template: HTMLTemplateElement, injectStatement: IInjectStatement) => void;

export default class TemplateMetadata
{
    public processed: boolean = false;

    public scope: Scope = { };

    public defaultInjectors: Map<string, DefaultFactory>                          = new Map();
    public injections:       Map<string, [HTMLTemplateElement, IInjectStatement]> = new Map();
    public injectors:        Map<string, Factory>                                 = new Map();

    public dispose?:   (node: Node, offset: number) => void;
    public onRemoved?: Action;

    public static from(target: object & { [TEMPLATE_METADATA]?: TemplateMetadata }): TemplateMetadata
    {
        return target[TEMPLATE_METADATA] = target[TEMPLATE_METADATA] ?? new TemplateMetadata();
    }

    public static hasMetadata(target: object & { [TEMPLATE_METADATA]?: TemplateMetadata }): boolean
    {
        return !!target[TEMPLATE_METADATA];
    }

    public merge(templateMetadata: TemplateMetadata): void
    {
        for (const [key, value] of templateMetadata.defaultInjectors)
        {
            this.defaultInjectors.set(key, value);
        }

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