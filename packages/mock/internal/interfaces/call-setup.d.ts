
import type { Callable, Overload, ParameterOverloads } from "@surface/core";
import type ResolveSetup                               from "../types/resolve-setup.js";

export default interface ICallSetup<TMethod extends Callable = Callable>
{
    call(...args: Parameters<TMethod>): ResolveSetup<TMethod>;
    call<TArgs extends ParameterOverloads<TMethod>>(...args: TArgs): ResolveSetup<Overload<TMethod, TArgs>>;
    call<TOverload extends Overload<TMethod, ParameterOverloads<TMethod>>>(...args: Parameters<TOverload>): ResolveSetup<TOverload>;
}