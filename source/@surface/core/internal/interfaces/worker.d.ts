import { Delegate } from "../types";

export default interface IWorker
{
    run(action: Delegate): void;
    whenDone(): Promise<void>;
}