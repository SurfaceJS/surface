import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Group                       from "../internal/group";

@suite
export default class GroupSpec
{
    @test @shouldPass
    public create(): void
    {
        const group = new Group<string, number>(1, "key");
        expect(group.hash,  "group.hash").to.equal(1);
        expect(group.key,   "group.key").to.equal("key");
        expect(group.count, "group.count").to.equal(0);
    }

    @test @shouldPass
    public createAndAdd(): void
    {
        const group = new Group<string, number>(1, "key");
        group.add(1);
        group.add(2);
        expect(group.count,    "group.count").to.equal(2);
        expect(group.elements, "group.elements").to.deep.equal([1, 2]);
    }

    @test @shouldPass
    public createAndAddNext(): void
    {
        const group = new Group<string, number>(1, "key-1");
        const next = new Group<string, number>(1, "key-2");
        group.next = next;

        expect(group.next).to.deep.equal(next);
    }

    @test @shouldPass
    public createAndAddHashNext(): void
    {
        const group    = new Group<string, number>(1, "key-1");
        const hashNext = new Group<string, number>(2, "key-2");
        group.hashNext = hashNext;

        expect(group.hashNext).to.deep.equal(hashNext);
    }
}