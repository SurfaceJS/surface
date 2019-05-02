import { suite, test } from "@surface/test-suite";
import * as chai       from "chai";
import ParallelWorker  from "../parallel-worker";

//declare var console: { log: Function };

@suite
export class ParallelWorkerSpce
{
    @test
    public run(): void
    {
        const indexes: Array<number> = [];

        const action = (id: number) =>
        {
            for (let index = 0; index < 1000 * 10; index++)
            {
                //console.log(id, index);
            }

            indexes.push(id);
        };

        ParallelWorker.default.run(() => action(1));
        ParallelWorker.default.run(() => action(2));
        ParallelWorker.default.run(() => action(3))
            .then(() => chai.expect(indexes).to.deep.equal([1, 2, 3]));
    }

    @test
    public runWithPriority(): void
    {
        const indexes: Array<number> = [];

        const action = (id: number) =>
        {
            for (let index = 0; index < 1000; index++)
            {
                //console.log(id, index);
            }

            indexes.push(id);
        };

        ParallelWorker.default.run(() => action(1), 1);
        ParallelWorker.default.run(() => action(2));
        ParallelWorker.default.run(() => action(3), 2)
            .then(() => chai.expect(indexes).to.deep.equal([3, 1, 2]));
    }

    @test
    public async runAsync(): Promise<void>
    {
        let order = 0;

        const action = (id: number) =>
        {
            for (let index = 0; index < 1000; index++)
            {
                //console.log(id, index);
            }

            order++;
        };

        await ParallelWorker.default.run(() => action(0));

        chai.expect(order).to.equal(1);

        await ParallelWorker.default.run(() => action(1));

        chai.expect(order).to.equal(2);

        await ParallelWorker.default.run(() => action(2));

        chai.expect(order).to.equal(3);

        chai.expect(true);
    }

    @test
    public async runAsyncResolvedValue(): Promise<void>
    {
        const action = (id: number) =>
        {
            for (let index = 0; index < 1000; index++)
            {
                //console.log(id, index);
            }
        };

        ParallelWorker.default.run(() => action(0));
        ParallelWorker.default.run(() => action(1));
        ParallelWorker.default.run(() => action(2));

        const value1 = await ParallelWorker.default.run(() => 1);

        chai.expect(value1).to.equal(1);

        const value2 = await ParallelWorker.default.run(() => 2);

        chai.expect(value2).to.equal(2);
    }
}