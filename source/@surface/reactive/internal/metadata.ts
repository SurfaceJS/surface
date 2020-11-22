import { IDisposable } from "@surface/core";
import Reactive        from "./reactive";

const METADATA = Symbol("reactive:metadata");

export default class Metadata
{
    public computed:        Map<string, string[][]>              = new Map();
    public disposables:     IDisposable[]                        = [];
    public isReactiveArray: boolean                              = false;
    public reactivePaths:   Map<string, Reactive>                = new Map();
    public trackings:       Map<string, Map<Reactive, string[]>> = new Map();

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        if (!target[METADATA])
        {
            Object.defineProperty(target, METADATA, { configurable: true, enumerable: false, value: new Metadata(), writable: false });
        }

        return target[METADATA]!;
    }

    public static of(target: object & { [METADATA]?: Metadata }): Metadata | undefined
    {
        return target[METADATA];
    }
}