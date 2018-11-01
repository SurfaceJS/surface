import { Indexer }             from "@surface/core";
import { hasValue }            from "@surface/core/common/generic";
import { enumerateObjectkeys } from "@surface/core/common/object";

export default class HashEncode
{
    private static getSignature(source: unknown): string
    {
        let signature = "";

        if (source instanceof Object && typeof source != "function")
        {
            for (const key of enumerateObjectkeys(source))
            {
                const value = (source as Indexer)[key];

                signature = signature ? `${signature},${key}:${HashEncode.getSignature(value)}` : `${key}:${HashEncode.getSignature(value)}`;
            }

            return `{${signature}}[${source.constructor.name}]`;
        }
        else if (hasValue(source))
        {
            return `${source.toString()}#${source.constructor.name}`;
        }

        return `${source}#?`;
    }

    public static getHashCode(source: unknown): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 32;

        const signature = HashEncode.getSignature(source);

        return signature.split("").reduce((previous, current) => (previous * bits * current.charCodeAt(0)) % max, initialValue);
    }
}