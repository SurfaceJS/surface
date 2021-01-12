import type { Callable, Delegate } from "@surface/core";
import type IReturnsSetup          from "./interfaces/returns-setup";
import Setup                       from "./setup.js";

export default class BaseSetup<TMethod extends Callable, TResult> implements IReturnsSetup<TMethod>
{
    public constructor(protected readonly setup: Setup<TResult> = new Setup(), private readonly args: unknown[] = [])
    { }

    public callback(action: (...args: Parameters<TMethod>) => void): this
    {
        this.setup.setCallbacks(this.args, action);

        return this;
    }

    public returns(value: TResult): void
    {
        this.setup.setReturns(this.args, value);
    }

    public returnsFactory(factory: Delegate<Parameters<TMethod>, TResult>): void
    {
        this.setup.setReturnsFactory(this.args, factory as Delegate<[], TResult>);
    }

    public throws(error: string | Error): void
    {
        this.setup.setThrows(this.args, error);
    }
}
