import type { Indexer }                     from "@surface/core";
import type { DirectiveEntry, NodeFactory } from "@surface/htmlx";

export const STATIC_METADATA = Symbol("custom-element:static-metadata");

export default class StaticMetadata
{
    public converters:         Indexer<(target: Indexer, value: string) => void> = { };
    public shadowRootInit:     ShadowRootInit                                    = { mode: "open" };
    public observedAttributes: string[]                                          = [];
    public styles:             CSSStyleSheet[]                                   = [];

    public directives: Map<string, DirectiveEntry> = new Map();
    public factory?:   NodeFactory;

    public static from(target: Function): StaticMetadata
    {
        if (!Reflect.has(target, STATIC_METADATA))
        {
            Reflect.defineProperty(target, STATIC_METADATA, { configurable: false, enumerable: false, value: new StaticMetadata() });
        }
        else if (!target.hasOwnProperty(STATIC_METADATA))
        {
            Reflect.defineProperty(target, STATIC_METADATA, { configurable: false, enumerable: false, value: (Reflect.get(target, STATIC_METADATA) as StaticMetadata).inherit() });
        }

        return Reflect.get(target, STATIC_METADATA) as StaticMetadata;
    }

    public inherit(): StaticMetadata
    {
        const clone = new StaticMetadata();

        clone.converters         = { ...this.converters };
        clone.observedAttributes = [...this.observedAttributes];
        clone.styles             = [...this.styles];
        clone.directives         = new Map(this.directives);

        return clone;
    }
}