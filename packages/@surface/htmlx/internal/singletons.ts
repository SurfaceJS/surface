import Scheduler from "./processors/scheduler.js";

export const scheduler = new Scheduler(16.17);

/** Returns a promise that will be resolved when all scheduled updated was executed. */
export async function painting(): Promise<void>
{
    return scheduler.execution();
}