
import type IHTMLXElement from "../interfaces/htmlx-element.js";

export const PROTOTYPE_METADATA = Symbol("htmlx:prototype-metadata");

export default class PrototypeMetadata
{
    public attributeChangedCallback?: IHTMLXElement["attributeChangedCallback"];

    public static from(target: object): PrototypeMetadata
    {
        if (!target.hasOwnProperty(PROTOTYPE_METADATA))
        {
            Reflect.defineProperty(target, PROTOTYPE_METADATA, { configurable: false, enumerable: false, value: new PrototypeMetadata() });
        }

        return Reflect.get(target, PROTOTYPE_METADATA) as PrototypeMetadata;
    }
}