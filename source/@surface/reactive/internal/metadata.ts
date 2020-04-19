import IDisposable  from "@surface/core/interfaces/disposable";
import { METADATA } from "./symbols";

export default class Metadata
{
    public disposables: Array<IDisposable> = [];

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata();
    }
}