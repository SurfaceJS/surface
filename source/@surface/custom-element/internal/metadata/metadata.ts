import { METADATA } from "../symbols";

export default class Metadata
{
    public reflectingAttribute: Set<string> = new Set();

    public host?: Node;

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }
}