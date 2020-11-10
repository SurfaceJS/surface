import ChangeTracker from "./change-tracker";
import Scheduler     from "./scheduler";

const scheduler     = new Scheduler(16.17);
const changeTracker = new ChangeTracker(scheduler, 20);

changeTracker.start();

export { changeTracker, scheduler };

export async function whenDone(): Promise<void>
{
    return changeTracker.nextCicle().then(async () => scheduler.whenDone());
}