import { type Delegate, deepEqual } from "@surface/core";
import { checkIt, sameIt }          from "./common.js";
import type Args                    from "./types/args.js";

export default class Setup<TResult>
{
    private readonly callbacks: Map<Args, Function> = new Map();
    private readonly factories: Map<Args, Delegate<Args, TResult>> = new Map();
    private readonly results:   Map<Args, TResult> = new Map();
    private readonly resolved:  Map<Args, Promise<TResult>> = new Map();
    private readonly rejected:  Map<Args, Promise<TResult>> = new Map();
    private readonly throws:    Map<Args, unknown> = new Map();

    private getKey<T>(source: Map<Args, T>, args: Args): Args
    {
        for (const key of source.keys())
        {
            if (deepEqual(key, args, sameIt))
            {
                return key;
            }
        }

        return args;
    }

    private getValue<T>(source: Map<Args, T>, args: Args): T | null
    {
        for (const [keys, value] of source)
        {
            if (deepEqual(keys, args, checkIt))
            {
                return value;
            }
        }

        return null;
    }

    public get(args: Args = []): Promise<TResult> | TResult | null
    {
        const error = this.getValue(this.throws, args);

        if (error)
        {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw error;
        }

        const callback = this.getValue(this.callbacks, args);

        if (callback)
        {
            callback(...args);
        }

        const factory = this.getValue(this.factories, args);

        if (factory)
        {
            return factory(...args);
        }

        const rejected = this.getValue(this.rejected, args);

        if (rejected)
        {
            return rejected;
        }

        const resolved = this.getValue(this.resolved, args);

        if (resolved)
        {
            return resolved;
        }

        return this.getValue(this.results, args);
    }

    public setCallbacks(args: Args, action: Function): void
    {
        this.callbacks.set(this.getKey(this.callbacks, args), action);
    }

    public setRejected(args: Args, reason: unknown): void
    {
        this.rejected.set(this.getKey(this.rejected, args), Promise.reject(reason));
    }

    public setResolved(args: Args, value: Awaited<TResult>): void
    {
        this.resolved.set(this.getKey(this.resolved, args), Promise.resolve(value));
    }

    public setReturns(args: Args, value: TResult): void
    {
        this.results.set(this.getKey(this.results, args), value);
    }

    public setReturnsFactory(args: Args, factory: Delegate<Args, TResult>): void
    {
        this.factories.set(this.getKey(this.factories, args), factory);
    }

    public setThrows(args: Args, error: Error | string): void
    {
        this.throws.set(this.getKey(this.throws, args), error);
    }
}
