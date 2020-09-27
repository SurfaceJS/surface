import { Callable, Delegate, Newable } from "@surface/core";
import IGetSetup              from "./get-setup";

export default interface IReturnsInstanceSetup<TConstructor extends Newable = Newable> extends IGetSetup<InstanceType<TConstructor>>
{
    callback(action: (...args: ConstructorParameters<TConstructor>) => void): this;
    returnsFactory(factory: Delegate<ConstructorParameters<TConstructor>, ReturnType<Callable>>): void;
}
