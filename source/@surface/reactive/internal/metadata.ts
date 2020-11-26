import { IDisposable } from "@surface/core";
import Reactive        from "./reactive";

const METADATA = Symbol("reactive:metadata");

export default class Metadata
{
    public computed:        Map<string, string[][]>              = new Map();
    public disposables:     IDisposable[]                        = [];
    public isReactiveArray: boolean                              = false;
    public paths:           Map<string, Reactive>                = new Map();
    public trackings:       Map<string, Map<Reactive, string[]>> = new Map();

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }

    public static of(target: object): Metadata | undefined
    {
        return Reflect.get(target, METADATA);
    }
}