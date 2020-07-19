import RouterSlot from "./router-outlet";

const METADATA = Symbol("view-router:metadata");

export default class Metadata
{
    public readonly outlets: Map<string, RouterSlot> = new Map();

    public static from(target: HTMLElement & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata();
    }
}