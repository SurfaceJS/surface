import type { Callable, Delegate } from "@surface/core";
import type IGetSetupSync          from "./get-setup-sync.js";

export default interface IReturnsSetupSync<TMethod extends Callable = Callable> extends IGetSetupSync<ReturnType<TMethod>>
{
    callback(action: (...args: Parameters<TMethod>) => void): this;
    returnsFactory(factory: Delegate<Parameters<TMethod>, ReturnType<Callable>>): void;
}
