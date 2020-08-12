import { PROTOTYPE_METADATA } from "../symbols";

export default class PrototypeMetadata
{
    public attributeChangedCallback?: (name: string, oldValue: string | undefined, newValue: string, namespace: string | undefined) => void;

    public static from(target: object & { [PROTOTYPE_METADATA]?: PrototypeMetadata }): PrototypeMetadata
    {
        return target[PROTOTYPE_METADATA] = !target.hasOwnProperty(PROTOTYPE_METADATA) && !!target[PROTOTYPE_METADATA]
            ? target[PROTOTYPE_METADATA]!.clone()
            : target[PROTOTYPE_METADATA] ?? new PrototypeMetadata();
    }

    public clone(): PrototypeMetadata
    {
        return new PrototypeMetadata();
    }
}