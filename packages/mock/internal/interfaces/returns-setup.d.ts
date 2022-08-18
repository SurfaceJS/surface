import type { Callable }      from "@surface/core";
import type IGetSetup         from "./get-setup.js";
import type IReturnsSetupSync from "./returns-setup-sync.js";

export default interface IReturnsSetup<TMethod extends Callable = Callable> extends IReturnsSetupSync<TMethod>, IGetSetup<ReturnType<TMethod>>
{ }
