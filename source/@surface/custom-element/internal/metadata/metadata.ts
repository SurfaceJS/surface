import ISubscription from "@surface/reactive/interfaces/subscription";
import { METADATA }  from "../symbols";

export default class Metadata
{
    public hasListener:         boolean              = false;
    public reflectingAttribute: boolean              = false;
    public subscriptions:       Array<ISubscription> = [];

    public static from(target: object & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata();
    }
}