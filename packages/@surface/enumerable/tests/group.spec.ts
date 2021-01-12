import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Group                       from "../internal/group.js";

@suite
export default class GroupSpec
{
    @test @shouldPass
    public create(): void
    {
        const group = new Group<string, number>(1, "key");
        chai.assert.equal(group.hash,  1,     "group.hash");
        chai.assert.equal(group.key,   "key", "group.key");
        chai.assert.equal(group.count, 0,     "group.count");
    }

    @test @shouldPass
    public createAndAdd(): void
    {
        const group = new Group<string, number>(1, "key");
        group.add(1);
        group.add(2);
        chai.assert.equal(group.count, 2, "group.count");
        chai.assert.deepEqual(group.elements, [1, 2], "group.elements");
    }

    @test @shouldPass
    public createAndAddNext(): void
    {
        const group = new Group<string, number>(1, "key-1");
        const next = new Group<string, number>(1, "key-2");
        group.next = next;

        chai.assert.deepEqual(group.next, next);
    }

    @test @shouldPass
    public createAndAddHashNext(): void
    {
        const group    = new Group<string, number>(1, "key-1");
        const hashNext = new Group<string, number>(2, "key-2");
        group.hashNext = hashNext;

        chai.assert.deepEqual(group.hashNext, hashNext);
    }
}