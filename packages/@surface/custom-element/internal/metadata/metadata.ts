export const METADATA = Symbol("custom-element:metadata");

export default class Metadata
{
    public reflectingAttribute: Set<string> = new Set();

    public host?: Node;

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }
}