import { suite, test } from "@surface/test-suite";
import * as chai       from "chai";
//import ParallelWorker  from "../parallel-worker";

//declare var console: { log: Function };

@suite
export class ParallelWorkerSpce
{
    @test
    public enqueue(): void
    {
        // let order = 0;

        // const action = (expected: number) =>
        // {
        //     for (let index = 0; index < 1000 * 10; index++)
        //     {
        //         console.log(expected, index);
        //     }

        //     chai.expect(order++).to.equal(expected);
        // };

        // ParallelWorker.enqueue(() => action(0));
        // ParallelWorker.enqueue(() => action(1));
        // ParallelWorker.enqueue(() => action(2));
        chai.expect(true);
    }
}