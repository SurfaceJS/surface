import type { IDisposable }                                          from "@surface/core";
import { disposeTree as disposeTreeSync }                            from "./common.js";
import Scheduler                                                     from "./processors/scheduler.js";
import type { DirectiveHandlerConstructor, DirectiveHandlerFactory } from "./types";

export const directiveRegistry = new Map<string, DirectiveHandlerConstructor | DirectiveHandlerFactory>();
export const scheduler         = new Scheduler(16.17);

export function disposeTree(node: Node & Partial<IDisposable>): void
{
    void scheduler.enqueue(() => disposeTreeSync(node), "low");
}