import { Indexer }         from "@surface/core";
import { STATIC_METADATA } from "../internal/symbols";

export default class StaticMetadata
{
    public conversionHandlers: Indexer<(target: Indexer, value: string) => void> = { };
    public observedAttributes: Array<string>                                     = [];
    public postConstruct:      Array<<T extends HTMLElement>(target: T) => void> = [];
    public styles:             Array<CSSStyleSheet>                              = [];

    public template?: HTMLTemplateElement;

    public static from(target: Function & { [STATIC_METADATA]?: StaticMetadata }): StaticMetadata
    {
        return target[STATIC_METADATA] = !target.hasOwnProperty(STATIC_METADATA) && !!target[STATIC_METADATA]
            ? target[STATIC_METADATA]!.clone()
            : target[STATIC_METADATA] ?? new StaticMetadata();
    }

    public clone(): StaticMetadata
    {
        const clone = new StaticMetadata();

        clone.conversionHandlers = { ...this.conversionHandlers };
        clone.observedAttributes = [...this.observedAttributes];
        clone.postConstruct      = [...this.postConstruct];
        clone.styles             = [...this.styles];

        return clone;
    }
}