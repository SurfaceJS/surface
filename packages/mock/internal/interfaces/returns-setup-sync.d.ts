import type { Callable, Delegate } from "@surface/core";
import type IGetSetupSync          from "./get-setup-sync.js";

export default interface IReturnsSetupSync<TMethod extends Callable = Callable> extends IGetSetupSync<ReturnType<TMethod>>
{

    /** Sets callback invoked when the method is called. */
    callback(action: (...args: Parameters<TMethod>) => void): this;

    /** Sets factory used to resolve the returned value. */
    returnsFactory(factory: Delegate<Parameters<TMethod>, ReturnType<TMethod>>): void;
}
