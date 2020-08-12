import { IDisposable } from "@surface/core";
import IReactor        from "./interfaces/reactor";
import Reactor         from "./reactor";

const METADATA = Symbol("reactive:metadata");

export default class Metadata
{
    public disposables:  IDisposable[] = [];
    public keys:         Set<string>   = new Set();
    public reactor:      IReactor      = new Reactor();
    public wrappedArray: boolean       = false;

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata();
    }

    public static of(target: object & { [METADATA]?: Metadata }): Metadata | undefined
    {
        return target[METADATA];
    }
}