import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import LinkedList                  from "../internal/linked-list.js";

@suite
export default class LinkedListSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        chai.assert.equal(new LinkedList().count(), 0);
    }

    @test @shouldPass
    public createFromSource(): void
    {
        const list = new LinkedList<number>([1, 2, 3]);

        chai.assert.equal(list.length, 3);
        chai.assert.equal(list.head?.value, 1);
        chai.assert.equal(list.tail?.value, 3);
    }

    @test @shouldPass
    public add(): void
    {
        const list = new LinkedList<number>();

        list.add(1);
        list.add(2);
        list.add(3);

        chai.assert.equal(list.length, 3);
        chai.assert.equal(list.head?.value, 1);
        chai.assert.equal(list.tail?.value, 3);
        chai.assert.deepEqual(list.head?.next, list.tail?.previous);
    }

    @test @shouldPass
    public remove(): void
    {
        const list = new LinkedList<number>([1, 2, 3]);

        const node1 = list.elementAt(0);
        const node2 = list.elementAt(1);
        const node3 = list.elementAt(2);

        chai.assert.deepEqual(Array.from(list), [node1, node2, node3]);

        list.remove(2);

        chai.assert.equal(list.length, 2);
        chai.assert.deepEqual(Array.from(list), [node1, node3]);
        chai.assert.deepEqual(list.head?.next,     list.tail);
        chai.assert.deepEqual(list.tail?.previous, list.head);

        list.remove(3);

        chai.assert.equal(list.length, 1);
        chai.assert.deepEqual(Array.from(list), [node1]);
        chai.assert.deepEqual(list.head, list.tail);

        list.remove(1);

        chai.assert.equal(list.length, 0);
        chai.assert.deepEqual(Array.from(list), []);
        chai.assert.deepEqual(list.head, null);
        chai.assert.deepEqual(list.tail, null);
    }

    @test @shouldPass
    public count(): void
    {
        const list = new LinkedList<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        chai.assert.equal(list.count(x => x.value % 2 == 0), 5);
    }

    @test @shouldPass
    public iterate(): void
    {
        const list = new LinkedList<number>([1, 2, 3, 4, 5]);

        let node = list.head;

        const actual = [node];

        while (node = node?.next ?? null)
        {
            actual.push(node);
        }

        chai.assert.deepEqual(actual, Array.from(list));
    }
}