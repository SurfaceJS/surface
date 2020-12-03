import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import Queue                       from "../internal/queue";

@suite
export default class QueueSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        assert.equal(new Queue().count(), 0);
    }

    @test @shouldPass
    public enqueueAndDequeue(): void
    {
        const queue = new Queue<number>();

        queue.enqueue(1);
        queue.enqueue(2);
        queue.enqueue(3);

        assert.equal(queue.length, 3);
        assert.equal(queue.dequeue(), 1);
        assert.equal(queue.dequeue(), 2);
        assert.equal(queue.dequeue(), 3);
        assert.equal(queue.length, 0);
    }

    @test @shouldPass
    public createFromArray(): void
    {
        const queue = new Queue([1, 2, 3]);

        assert.equal(queue.length, 3);
        assert.equal(queue.dequeue(), 1);
        assert.equal(queue.dequeue(), 2);
        assert.equal(queue.dequeue(), 3);
        assert.equal(queue.length, 0);
    }

    @test @shouldPass
    public clear(): void
    {
        const queue = new Queue([1, 2, 3]);

        assert.equal(queue.length, 3);

        queue.clear();

        assert.equal(queue.length, 0);
    }

    @test @shouldPass
    public enumerate(): void
    {
        const queue = new Queue([1, 2, 3]);

        assert.deepEqual(Array.from(queue), [1, 2, 3]);
    }
}