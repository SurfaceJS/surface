import { Callable, Delegate } from "@surface/core";
import IGetSetup              from "./get-setup";

export default interface IReturnsSetup<TMethod extends Callable = Callable> extends IGetSetup<ReturnType<TMethod>>
{
    callback(action: (...args: Parameters<TMethod>) => void): this;
    returnsFactory(factory: Delegate<Parameters<TMethod>, ReturnType<Callable>>): void;
}
