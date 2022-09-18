import type { Callable, Delegate, Newable } from "@surface/core";
import type IGetSetupSync                   from "./get-setup-sync.js";

export default interface IReturnsInstanceSetup<TConstructor extends Newable = Newable> extends IGetSetupSync<InstanceType<TConstructor>>
{

    /** Sets callback invoked when the constructor is called. */
    callback(action: (...args: ConstructorParameters<TConstructor>) => void): this;

    /** Sets factory used to resolve the returned instance. */
    returnsFactory(factory: Delegate<ConstructorParameters<TConstructor>, ReturnType<Callable>>): void;
}
