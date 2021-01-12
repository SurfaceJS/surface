import type { IDisposable } from "@surface/core";
import type Observer        from "./observer.js";

const METADATA = Symbol("reactive:metadata");

export default class Metadata
{
    public computed:        Map<string, string[][]>              = new Map();
    public disposables:     IDisposable[]                        = [];
    public isReactiveArray: boolean                              = false;
    public observers:       Map<string, Observer>                = new Map();
    public subjects:        Map<string, Map<Observer, string[]>> = new Map();

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { value: new Metadata() });
        }

        return Reflect.get(target, METADATA) as Metadata;
    }
}