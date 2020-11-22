import { IDisposable } from "@surface/core";
import { METADATA }    from "../symbols";

export default class Metadata
{
    public readonly disposables: IDisposable[] = [];

    public disposed:            boolean = false;
    public hasListener:         boolean = false;
    public reflectingAttribute: boolean = false;

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata();
    }

    public static of(target: object & { [METADATA]?: Metadata }): Metadata | undefined
    {
        return target[METADATA];
    }
}