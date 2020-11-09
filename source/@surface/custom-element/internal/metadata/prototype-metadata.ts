
import ICustomElement         from "../interfaces/custom-element";
import { PROTOTYPE_METADATA } from "../symbols";

export default class PrototypeMetadata
{
    public adoptedCallback?:          ICustomElement["adoptedCallback"];
    public attributeChangedCallback?: ICustomElement["attributeChangedCallback"];
    public connectedCallback?:        ICustomElement["connectedCallback"];
    public disconnectedCallback?:     ICustomElement["disconnectedCallback"];

    public static from(target: object & { [PROTOTYPE_METADATA]?: PrototypeMetadata }): PrototypeMetadata
    {
        return target[PROTOTYPE_METADATA] = !target.hasOwnProperty(PROTOTYPE_METADATA) && !!target[PROTOTYPE_METADATA]
            ? target[PROTOTYPE_METADATA]!.clone()
            : target[PROTOTYPE_METADATA] ?? new PrototypeMetadata();
    }

    public static of(target: object & { [PROTOTYPE_METADATA]?: PrototypeMetadata }): PrototypeMetadata | undefined
    {
        return target[PROTOTYPE_METADATA];
    }

    public clone(): PrototypeMetadata
    {
        return new PrototypeMetadata();
    }
}