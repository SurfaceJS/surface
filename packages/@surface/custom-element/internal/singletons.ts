import type { IDisposable }               from "@surface/core";
import { disposeTree as disposeTreeSync } from "./common.js";
import Scheduler                          from "./processors/scheduler.js";
import type { DirectiveEntry }            from "./types";

export const globalCustomDirectives = new Map<string, DirectiveEntry>();
export const scheduler              = new Scheduler(16.17);

/** Deeply disposes a node tree. */
export function disposeTree(node: Node & Partial<IDisposable>): void
{
    void scheduler.enqueue(() => disposeTreeSync(node), "low");
}

/** Returns a promise that will be resolved when all scheduled updated was executed. */
export async function painting(): Promise<void>
{
    return scheduler.execution();
}