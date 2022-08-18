import { Callable, Newable }  from "@surface/core";
import type IReturnsSetupSync from "../interfaces/returns-setup-sync.js";
import type IReturnsSetup     from "../interfaces/returns-setup.js";

type ResolveSetup<T extends Callable> =
    ReturnType<T> extends Promise<unknown>
        ? IReturnsSetup<T>
        : IReturnsSetupSync<T>;

export default ResolveSetup;