import { IDisposable, Indexer } from "@surface/core";
import ITemplateDescriptor      from "../interfaces/template-descriptor";
import { STATIC_METADATA }      from "../symbols";

export default class StaticMetadata
{
    public converters:         Indexer<(target: Indexer, value: string) => void>     = { };
    public finishers:          (<T extends HTMLElement>(target: T) => IDisposable)[] = [];
    public observedAttributes: string[]                                              = [];
    public styles:             CSSStyleSheet[]                                       = [];

    public template?:   HTMLTemplateElement;
    public descriptor?: ITemplateDescriptor;

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

        clone.converters         = { ...this.converters };
        clone.finishers          = [...this.finishers];
        clone.observedAttributes = [...this.observedAttributes];
        clone.styles             = [...this.styles];

        return clone;
    }
}