import type { IDisposable }               from "@surface/core";
import { disposeTree as disposeTreeSync } from "./common.js";
import Scheduler                          from "./processors/scheduler.js";
import type {  DirectiveHandlerEntry }    from "./types";

export const globalCustomDirectives = new Map<string, DirectiveHandlerEntry>();
export const scheduler              = new Scheduler(16.17);

export function disposeTree(node: Node & Partial<IDisposable>): void
{
    void scheduler.enqueue(() => disposeTreeSync(node), "low");
}

export async function paintingDone(): Promise<void>
{
    return scheduler.whenDone();
}