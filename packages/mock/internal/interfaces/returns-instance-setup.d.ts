import type { Callable, Delegate, Newable } from "@surface/core";
import type IGetSetupSync                   from "./get-setup-sync.js";

export default interface IReturnsInstanceSetup<TConstructor extends Newable = Newable> extends IGetSetupSync<InstanceType<TConstructor>>
{
    callback(action: (...args: ConstructorParameters<TConstructor>) => void): this;
    returnsFactory(factory: Delegate<ConstructorParameters<TConstructor>, ReturnType<Callable>>): void;
}
