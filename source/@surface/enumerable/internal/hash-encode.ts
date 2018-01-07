import Enumerable from "..";

import { Nullable } from "@surface/types";

export default class HashEncode
{
    private static getSignature(source: Object): string
    {
        return Enumerable.from(Object.entries(source))
            .select(x => `${x[0]}:${x[1]}#${x[1] !== null && x[1] !== undefined ? x[1].constructor.name : "?"}`)
            .aggregate((previous, current) => previous + "," + current)
            + `[${source.constructor.name}]`;
    }

    public static getHashCode(source: Nullable<Object>): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 32;

        let signature = source === undefined
            || source === null
            || typeof source == "boolean"
            || typeof source == "function"
            || typeof source == "number"
            || typeof source == "string"
            || typeof source == "symbol" ?
                HashEncode.getSignature({ value: source })
                : HashEncode.getSignature(source);

        return signature.split("").reduce((previous, current) => (previous * bits * current.charCodeAt(0)) % max, initialValue);
    }
}