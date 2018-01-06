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
        const shift        = 5;

        let signature = source == "object" ? HashEncode.getSignature(source) : source.toString();

        return (signature + "").split("").reduce((previous, current) => (previous * current.charCodeAt(0) << shift) % max, initialValue);
    }
}