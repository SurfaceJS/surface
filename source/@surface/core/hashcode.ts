import { Indexer }             from ".";
import { hasValue }            from "./common/generic";
import { enumerateObjectkeys } from "./common/object";

export default class Hashcode
{
    private static getSignature(source: unknown): string
    {
        let signature = "";

        if (source instanceof Object && typeof source != "function")
        {
            for (const key of enumerateObjectkeys(source))
            {
                const value = (source as Indexer)[key];

                signature = signature ? `${signature},${key}:${Hashcode.getSignature(value)}` : `${key}:${Hashcode.getSignature(value)}`;
            }

            return `{${signature}}[${source.constructor.name}]`;
        }
        else if (hasValue(source))
        {
            return `${source.toString()}#${source.constructor.name}`;
        }

        return `${source}#?`;
    }

    public static encode(source: unknown): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 32;

        const signature = Hashcode.getSignature(source);

        return signature.split("").reduce((previous, current) => (previous * bits * current.charCodeAt(0)) % max, initialValue);
    }
}