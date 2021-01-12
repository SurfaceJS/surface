import type { Callable } from "@surface/core";
import BaseSetup         from "./base-setup.js";
import type IExecutable  from "./interfaces/executable";

export default class ReturnSetup<TMethod extends Callable, TResult> extends BaseSetup<TMethod, TResult>
    implements IExecutable<TResult | null>
{
    public execute(): TResult | null
    {
        return this.setup.get();
    }
}