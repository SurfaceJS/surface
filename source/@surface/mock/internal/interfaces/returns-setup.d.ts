import { Factory, FunctionType } from "../types";
import IGetSetup                 from "./get-setup";

export default interface IReturnsSetup<TMethod extends FunctionType = FunctionType, TResult = unknown> extends IGetSetup<TResult>
{
    callback(action: (...args: Parameters<TMethod>) => void): void;
    returnsFactory(factory: Factory<Parameters<TMethod>, TResult>): void;
}
