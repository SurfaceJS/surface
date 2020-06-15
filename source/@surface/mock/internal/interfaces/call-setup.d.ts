import IReturnsSetup    from "./returns-setup";
import { FunctionType } from "../types";

export default interface ICallSetup<TMethod extends FunctionType = FunctionType, TResult extends ReturnType<TMethod> = ReturnType<TMethod>> extends IReturnsSetup<TMethod, TResult>
{
    call(...args: Parameters<TMethod>): IReturnsSetup<TMethod, TResult>;
}