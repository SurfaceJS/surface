import { IDisposable } from "@surface/core";

const STATIC_METADATA = Symbol("reactive:static-metadata");

export default class StaticMetadata
{
    public actions: ((instance: object) => IDisposable)[] = [];

    public static from (target: Function & { [STATIC_METADATA]?: StaticMetadata }): StaticMetadata
    {
        return target[STATIC_METADATA] = !target.hasOwnProperty(STATIC_METADATA) && !!target[STATIC_METADATA]
            ? target[STATIC_METADATA]!.clone()
            : target[STATIC_METADATA] ?? new StaticMetadata();
    }

    public clone(): StaticMetadata
    {
        const clone = new StaticMetadata();

        clone.actions = [...this.actions];

        return clone;
    }
}