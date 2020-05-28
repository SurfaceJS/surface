import { Indexer }              from "./types";
import { hasValue, isIterable } from "./common/generic";
import { enumerateKeys }        from "./common/object";

export default class Hashcode
{
    private readonly cache:      Map<object, string> = new Map();
    private readonly references: Set<object>         = new Set();

    public static encode(source: unknown): number
    {
        return new Hashcode().encode(source);
    }

    private encode(source: unknown): number
    {
        const initialValue = 7;
        const max          = 0x7FFFFFFF;
        const bits         = 32;

        const signature = this.getSignature(source);

        return signature.split("").reduce((previous, current) => (previous * bits * current.charCodeAt(0)) % max, initialValue);
    }

    private getSignature(source: unknown): string
    {
        let signature = "";

        if (typeof source == "object" && source)
        {
            const cache = this.cache.get(source);

            if (cache)
            {
                return cache;
            }

            if (isIterable(source))
            {
                let index = 0;
                for (const element of source)
                {
                    signature = signature ? `${signature},${index}:${this.getSignature(element)}` : `${index}:${this.getSignature(element)}`;
                    index++;
                }

                signature = `[${signature}][${source.constructor.name}]`;
            }
            else
            {
                if (this.references.has(source))
                {
                    return `[circular][${source.constructor.name}]`;
                }

                this.references.add(source);

                for (const key of enumerateKeys(source))
                {
                    const value = (source as Indexer)[String(key)];

                    signature = signature ? `${signature},${String(key)}:${this.getSignature(value)}` : `${String(key)}:${this.getSignature(value)}`;
                }

                this.references.delete(source);

                signature = `{${signature}}[${source.constructor.name}]`;
            }

            this.cache.set(source, signature);
        }
        else if (hasValue(source))
        {
            signature = `${source.toString()}#${source.constructor.name}`;
        }
        else
        {
            signature = `${source}#?`;
        }

        return signature;
    }
}