import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import Group                       from "../internal/group.js";

@suite
export default class GroupSpec
{
    @test @shouldPass
    public create(): void
    {
        const group = new Group<string, number>(1, "key");
        assert.equal(group.hash,  1,     "group.hash");
        assert.equal(group.key,   "key", "group.key");
        assert.equal(group.count, 0,     "group.count");
    }

    @test @shouldPass
    public createAndAdd(): void
    {
        const group = new Group<string, number>(1, "key");
        group.add(1);
        group.add(2);
        assert.equal(group.count, 2, "group.count");
        assert.deepEqual(group.elements, [1, 2], "group.elements");
    }

    @test @shouldPass
    public createAndAddNext(): void
    {
        const group = new Group<string, number>(1, "key-1");
        const next = new Group<string, number>(1, "key-2");
        group.next = next;

        assert.deepEqual(group.next, next);
    }

    @test @shouldPass
    public createAndAddHashNext(): void
    {
        const group    = new Group<string, number>(1, "key-1");
        const hashNext = new Group<string, number>(2, "key-2");
        group.hashNext = hashNext;

        assert.deepEqual(group.hashNext, hashNext);
    }
}
