import IReturnsSetup             from "./interfaces/returns-setup";
import Setup                     from "./setup";
import { Factory, FunctionType } from "./types";

export default class BaseSetup<TMethod extends FunctionType, TResult> implements IReturnsSetup<TMethod, TResult>
{
    public constructor(protected readonly setup: Setup<TResult> = new Setup(), private readonly args: Array<unknown> = [])
    { }

    public callback(action: (...args: Parameters<TMethod>) => void): void
    {
        this.setup.setCallbacks(this.args, action);
    }

    public returns(value: TResult): void
    {
        this.setup.setReturns(this.args, value);
    }

    public returnsFactory(factory: Factory<Parameters<TMethod>, TResult>): void
    {
        this.setup.setReturnsFactory(this.args, factory as Factory<Array<unknown>, TResult>);
    }

    public throws(error: string | Error): void
    {
        this.setup.setThrows(this.args, error);
    }
}
