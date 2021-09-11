import type { Indexer }        from "@surface/core";
import type NodeFactory        from "../aot/types/node-fatctory.js";
import type TemplateDescriptor from "../types/template-descriptor-legacy";

export const STATIC_METADATA = Symbol("custom-element:static-metadata");

export default class StaticMetadata
{
    public converters:         Indexer<(target: Indexer, value: string) => void> = { };
    public shadowRootInit:     ShadowRootInit                                    = { mode: "open" };
    public observedAttributes: string[]                                          = [];
    public styles:             CSSStyleSheet[]                                   = [];

    public template?:   HTMLTemplateElement;
    public factory?:    NodeFactory;
    public descriptor!: TemplateDescriptor;

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

        return clone;
    }
}