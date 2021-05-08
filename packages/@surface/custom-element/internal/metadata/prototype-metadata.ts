
import type ICustomElement from "../interfaces/custom-element";

export const PROTOTYPE_METADATA = Symbol("custom-element:prototype-metadata");

export default class PrototypeMetadata
{
    public attributeChangedCallback?: ICustomElement["attributeChangedCallback"];

    public static from(target: object): PrototypeMetadata
    {
        if (!target.hasOwnProperty(PROTOTYPE_METADATA))
        {
            Reflect.defineProperty(target, PROTOTYPE_METADATA, { configurable: false, enumerable: false, value: new PrototypeMetadata() });
        }

        return Reflect.get(target, PROTOTYPE_METADATA) as PrototypeMetadata;
    }

    public inherit(): PrototypeMetadata
    {
        return new PrototypeMetadata();
    }
}