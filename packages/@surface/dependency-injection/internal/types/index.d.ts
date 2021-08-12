import type { Constructor, IDisposable } from "@surface/core";
import type Container                    from "../container.js";

export type Factory = (container: Pick<Container, "resolve">) => Partial<IDisposable>;
export type Key = string | symbol | Constructor;