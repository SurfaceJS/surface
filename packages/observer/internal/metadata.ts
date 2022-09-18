import type { IDisposable }   from "@surface/core";
import { DisposableMetadata } from "@surface/core";
import type Observer          from "./observer.js";

const METADATA = Symbol("observer:metadata");

export default class Metadata implements IDisposable
{
    public computed:        Map<string, string[][]>              = new Map();
    public isReactiveArray: boolean                              = false;
    public observers:       Map<string, Observer>                = new Map();
    public subjects:        Map<string, Map<Observer, string[]>> = new Map();

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            const metadata = new Metadata();

            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: metadata });

            DisposableMetadata.from(target).add(metadata);
        }

        return Reflect.get(target, METADATA) as Metadata;
    }

    public dispose(): void
    {
        this.observers.forEach(x => x.dispose());
        this.observers.clear();
        this.subjects.clear();
    }
}