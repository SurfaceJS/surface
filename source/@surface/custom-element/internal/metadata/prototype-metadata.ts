
import ICustomElement         from "../interfaces/custom-element";
import { PROTOTYPE_METADATA } from "../symbols";

export default class PrototypeMetadata
{
    public adoptedCallback?:          ICustomElement["adoptedCallback"];
    public attributeChangedCallback?: ICustomElement["attributeChangedCallback"];
    public connectedCallback?:        ICustomElement["connectedCallback"];
    public disconnectedCallback?:     ICustomElement["disconnectedCallback"];

    public static from(target: object): PrototypeMetadata
    {
        if (!Reflect.has(target, PROTOTYPE_METADATA))
        {
            Reflect.defineProperty(target, PROTOTYPE_METADATA, { value: new PrototypeMetadata() });
        }
        else if (!target.hasOwnProperty(PROTOTYPE_METADATA))
        {
            return (Reflect.get(target, PROTOTYPE_METADATA) as PrototypeMetadata).clone();
        }

        return Reflect.get(target, PROTOTYPE_METADATA) as PrototypeMetadata;
    }

    public static of(target: object): PrototypeMetadata | undefined
    {
        return Reflect.get(target, PROTOTYPE_METADATA);
    }

    public clone(): PrototypeMetadata
    {
        return new PrototypeMetadata();
    }
}