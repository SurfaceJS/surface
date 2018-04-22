import { Unknown } from "@surface/types";

export default class HashEncode
{
    private static getEntrySignature(key: string, source: Object): string
    {
        const value = source[key];

        return `${key}:${typeof value == "symbol" ? value.toString() : value}#${value != null && value != undefined ? value.constructor.name : "?"}`;
    }

    private static getSignature(source: Object): string
    {
        const entries = source.constructor == Object ?
            Object.getOwnPropertyNames(source) :
            Object.getOwnPropertyNames(source).concat(Object.getOwnPropertyNames(source.constructor.prototype));

        let signature = "";

        for (const key of entries)
        {
            if (signature)
            {
                signature = `${signature},${HashEncode.getEntrySignature(key, source)}`;
            }
            else
            {
                signature = HashEncode.getEntrySignature(key, source);
            }
        }

        return `${signature}[${source.constructor.name}]`;
    }

    public static getHashCode(source: Unknown): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 32;

        const signature = typeof source != "object" || typeof source == "object" && source == null ?
                HashEncode.getSignature({ __value__: source })
                : HashEncode.getSignature(source);

        return signature.split("").reduce((previous, current) => (previous * bits * current.charCodeAt(0)) % max, initialValue);
    }
}