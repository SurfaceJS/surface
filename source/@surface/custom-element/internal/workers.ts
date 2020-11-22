import Scheduler from "./scheduler";

export const scheduler = new Scheduler(16.17);

export async function whenDone(): Promise<void>
{
    return scheduler.whenDone();
}