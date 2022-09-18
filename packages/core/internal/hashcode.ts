import { isIterable }    from "./common/generic.js";
import { enumerateKeys } from "./common/object.js";
import type { Indexer }  from "./types/index.js";

export default class Hashcode
{
    private readonly cache:      Map<object, string>           = new Map();
    private readonly references: Set<object>                   = new Set();
    private readonly stack:      (string | number | symbol)[]  = ["$root"];

    public static encode(source: unknown): number
    {
        return new Hashcode().encode(source);
    }

    private buildPath(): string
    {
        const iterator = this.stack[Symbol.iterator]();

        let path = "";

        let next = iterator.next();

        if (!next.done)
        {
            do
            {
                path += typeof next.value == "string" ? next.value as string : `[${String(next.value)}]`;

                next = iterator.next();

                if (!next.done)
                {
                    path += typeof next.value == "string" ? "." : "";
                }

            } while (!next.done);
        }

        return path;
    }

    private encode(source: unknown): number
    {
        let hash = 0;

        for (const token of this.getTokens(source))
        {
            for (const char of token)
            {
                hash = (hash << 5) - hash + char.charCodeAt(0) | 0;
            }
        }

        return 0x7FFFFFFF ^ Math.abs(hash);
    }

    private *enumerateArrayTokens(source: Iterable<unknown>): Iterable<string>
    {
        const cache = this.cache.get(source);

        if (cache)
        {
            yield "{";
            yield "\"$ref\"";
            yield ":";
            yield `"${cache}"`;
            yield "}";

            return;
        }

        this.cache.set(source, this.buildPath());

        yield "[";

        const iterator = source[Symbol.iterator]();

        let next = iterator.next();

        if (!next.done)
        {
            let index = 0;

            do
            {
                this.stack.push(index);

                for (const token of this.getTokens(next.value))
                {
                    yield token;
                }

                this.stack.pop();

                next = iterator.next();

                if (!next.done)
                {
                    index++;

                    yield ",";
                }

            } while (!next.done);
        }

        yield "]";
    }

    private *enumerateObjectTokens(source: object): Iterable<string>
    {
        const cache = this.cache.get(source);

        if (cache)
        {
            yield "{";
            yield "\"$ref\"";
            yield ":";
            yield `"${cache}"`;
            yield "}";

            return;
        }

        this.cache.set(source, this.buildPath());

        yield "{";

        yield "\"$type\"";
        yield ":";
        yield `"${source.constructor.name}"`;

        const iterator = enumerateKeys(source);

        let next = iterator.next();

        if (!next.done)
        {
            yield ",";

            do
            {
                yield `"${String(next.value)}"`;
                yield ":";

                this.stack.push(next.value);

                for (const token of this.getTokens((source as Indexer)[next.value as string | number]))
                {
                    yield token;
                }

                this.stack.pop();

                next = iterator.next();

                if (!next.done)
                {
                    yield ",";
                }

            } while (!next.done);
        }

        yield "}";
    }

    private *getTokens(source: unknown): Iterable<string>
    {
        if (typeof source == "object" && source)
        {
            if (this.references.has(source))
            {
                yield "{";
                yield "\"$ref\"";
                yield ":";
                yield `"${this.cache.get(source)}"`;
                yield "}";

                return;
            }

            this.references.add(source);

            if (isIterable(source))
            {
                for (const token of this.enumerateArrayTokens(source))
                {
                    yield token;
                }
            }
            else
            {
                for (const token of this.enumerateObjectTokens(source))
                {
                    yield token;
                }
            }

            this.references.delete(source);
        }
        else if (typeof source == "string" || typeof source == "function")
        {
            yield `"${source}"`;
        }
        else
        {
            yield String(source);
        }
    }
}