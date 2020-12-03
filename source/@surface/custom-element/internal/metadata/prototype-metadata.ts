
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
            Reflect.defineProperty(target, PROTOTYPE_METADATA, { value: (Reflect.get(target, PROTOTYPE_METADATA) as PrototypeMetadata).inherit() });
        }

        return Reflect.get(target, PROTOTYPE_METADATA) as PrototypeMetadata;
    }

    public inherit(): PrototypeMetadata
    {
        return new PrototypeMetadata();
    }
}