import { STATIC_METADATA } from "./symbols";

export default class StaticMetadata
{
    public actions: Array<(instance: object) => void> = [];

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