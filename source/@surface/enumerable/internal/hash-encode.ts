import Enumerable from "..";

export default class HashEncode
{
    private static getSignature(source: Object): string
    {
        return Enumerable.from(Object.entries(source))
            .select(x => `${x[0]}:${x[1]}#${x[1] ? x[1].constructor.name : "?"}`)
            .concat([source.constructor.name])
            .aggregate((previous, current) => previous + ";" + current);
    }

    public static getHashCode(source: Object): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 31;

        source = typeof source == "object" ? source : { value: source };

        let signature = HashEncode.getSignature(source);

        return (signature + "").split("").reduce((memo, item) => (memo * bits * item.charCodeAt(0)) % max, initialValue);
    }
}