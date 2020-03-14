import { Nullable } from "@surface/core";
import { METADATA } from "./symbols";

export default class Metadata
{
    public reflectingAttribute: boolean = false;

    public attributeChangedCallback?: (name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>) => void;

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = !target.hasOwnProperty(METADATA) && !!target[METADATA]
            ? target[METADATA]!.clone()
            : target[METADATA] ?? new Metadata();
    }

    public clone(): Metadata
    {
        return new Metadata();
    }
}