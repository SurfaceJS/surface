import { IDisposable, Indexer } from "@surface/core";
import { STATIC_METADATA }      from "../symbols";

export default class StaticMetadata
{
    public conversionHandlers: Indexer<(target: Indexer, value: string) => void>     = { };
    public observedAttributes: string[]                                              = [];
    public postConstruct:      (<T extends HTMLElement>(target: T) => IDisposable)[] = [];
    public styles:             CSSStyleSheet[]                                       = [];

    public template?: HTMLTemplateElement;

    public static from(target: Function & { [STATIC_METADATA]?: StaticMetadata }): StaticMetadata
    {
        return target[STATIC_METADATA] = !target.hasOwnProperty(STATIC_METADATA) && !!target[STATIC_METADATA]
            ? target[STATIC_METADATA]!.clone()
            : target[STATIC_METADATA] ?? new StaticMetadata();
    }

    public static of(target: Function & { [STATIC_METADATA]?: StaticMetadata }): StaticMetadata | undefined
    {
        return target[STATIC_METADATA];
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