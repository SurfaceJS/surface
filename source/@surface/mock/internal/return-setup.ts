import BaseSetup        from "./base-setup";
import IExecutable      from "./interfaces/executable";
import { FunctionType } from "./types";

export default class ReturnSetup<TMethod extends FunctionType, TResult> extends BaseSetup<TMethod, TResult>
    implements IExecutable<TResult | null>
{
    public execute(): TResult | null
    {
        return this.setup.get();
    }
}