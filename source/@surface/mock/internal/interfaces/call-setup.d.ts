
import type { Callable, Overload, ParameterOverloads } from "@surface/core";
import type IReturnsSetup                              from "./returns-setup";

export default interface ICallSetup<TMethod extends Callable = Callable>
{
    call(...args: Parameters<TMethod>): IReturnsSetup<TMethod>;
    call<TArgs extends ParameterOverloads<TMethod>>(...args: TArgs): IReturnsSetup<Overload<TMethod, TArgs>>;
    call<TOverload extends Overload<TMethod, ParameterOverloads<TMethod>>>(...args: Parameters<TOverload>): IReturnsSetup<TOverload>;
}