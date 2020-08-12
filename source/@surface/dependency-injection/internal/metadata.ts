import { Constructor } from "@surface/core";

const METADATA = Symbol("dependency-injection:static-metadata");

export default class StaticMetadata
{
    public readonly parameters: (string | symbol | Constructor)[]                  = [];
    public readonly properties: [string | symbol, string | symbol | Constructor][] = [];

    public static from(target: Function & { [METADATA]?: StaticMetadata }): StaticMetadata
    {
        return target[METADATA] = target[METADATA] ?? new StaticMetadata();
    }

    public static of(target: Function & { [METADATA]?: StaticMetadata }): StaticMetadata | undefined
    {
        return target[METADATA];
    }
}