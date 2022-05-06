import type { Delegate }  from "@surface/core";
import { Hashcode }       from "@surface/core";
import type { IComparer } from "@surface/enumerable";
import Enumerable         from "@surface/enumerable";
import { isIt }           from "./common.js";
import type Args          from "./types/args";

const comparer: IComparer<unknown> =
{
    compare: () => 0,
    equals:  (left, right) => Object.is(left, right) || typeof left == typeof right && Hashcode.encode(left) == Hashcode.encode(right),
};

export default class Setup<TResult>
{
    private readonly callbacks: Map<Args, Function> = new Map();
    private readonly factories: Map<Args, Delegate<Args, TResult>> = new Map();
    private readonly results:   Map<Args, TResult> = new Map();
    private readonly resolveds: Map<Args, Promise<TResult>> = new Map();
    private readonly rejecteds: Map<Args, Promise<TResult>> = new Map();
    private readonly throws:    Map<Args, unknown> = new Map();

    private all(source: Args, args: Args): boolean
    {
        if (source.length != args.length)
        {
            return false;
        }

        for (let index = 0; index < source.length; index++)
        {
            const sourceElement = source[index];
            const argsElement   = args[index];

            const isEqual = this.checkIt(sourceElement, argsElement) || comparer.equals(sourceElement, argsElement);

            if (!isEqual)
            {
                return false;
            }
        }

        return true;
    }

    private checkIt(it: unknown, value: unknown): boolean
    {
        if (isIt(it))
        {
            return it(value);
        }

        return false;
    }

    private getFrom<T>(source: Map<Args, T>, args: Args): T | null
    {
        for (const [keys, value] of source)
        {
            if (this.all(keys, args))
            {
                return value;
            }
        }

        return null;
    }

    private getKey<T>(source: Map<Args, T>, args: Args): Args
    {
        const sequence = Enumerable.from(args);

        return Enumerable.from(source.keys())
            .firstOrDefault(x => sequence.sequenceEqual(Enumerable.from(x), comparer)) ?? args;
    }

    public get(args: Args = []): Promise<TResult> | TResult | null
    {
        const error = this.getFrom(this.throws, args);

        if (error)
        {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw error;
        }

        const callback = this.getFrom(this.callbacks, args);

        if (callback)
        {
            callback(...args);
        }

        const factory = this.getFrom(this.factories, args);

        if (factory)
        {
            return factory(...args);
        }

        const rejected = this.getFrom(this.rejecteds, args);

        if (rejected)
        {
            return rejected;
        }

        const resolved = this.getFrom(this.resolveds, args);

        if (resolved)
        {
            return resolved;
        }

        return this.getFrom(this.results, args);
    }

    public setCallbacks(args: Args, action: Function): void
    {
        this.callbacks.set(this.getKey(this.callbacks, args), action);
    }

    public setRejected(args: Args, reason: unknown): void
    {
        this.rejecteds.set(this.getKey(this.results, args), Promise.reject(reason));
    }

    public setResolved(args: Args, value: Awaited<TResult>): void
    {
        this.resolveds.set(this.getKey(this.results, args), Promise.resolve(value));
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
