import Scheduler           from "./processors/scheduler.js";
import type DirectiveEntry from "./types/directive-entry";

export const globalCustomDirectives = new Map<string, DirectiveEntry>();
export const scheduler              = new Scheduler(16.17);

/** Returns a promise that will be resolved when all scheduled updated was executed. */
export async function painting(): Promise<void>
{
    return scheduler.execution();
}