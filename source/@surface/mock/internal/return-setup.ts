import { Nullable }     from "../../core";
import BaseSetup        from "./base-setup";
import IExecutable      from "./interfaces/executable";
import { FunctionType } from "./types";

export default class ReturnSetup<TMethod extends FunctionType, TResult> extends BaseSetup<TMethod, TResult>
implements IExecutable<Nullable<TResult>>
{
    public execute(): Nullable<TResult>
    {
        return this.setup.get();
    }
}