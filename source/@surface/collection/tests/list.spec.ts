import { ArgumentOutOfRangeError }             from "@surface/core";
import Enumerable                              from "@surface/enumerable";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import List                                    from "../internal/list.js";

@suite
export default class ListSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        chai.assert.equal(new List().length, 0);
    }

    @test @shouldPass
    public createFromArray(): void
    {
        const list = new List([1, 2, 3]);

        chai.assert.equal(list[0],     1, "list[0]");
        chai.assert.equal(list[1],     2, "list[1]");
        chai.assert.equal(list[2],     3, "list[2]");
        chai.assert.equal(list.length, 3, "list.length");
    }

    @test @shouldPass
    public createFromIterable(): void
    {
        const list = new List(Enumerable.from([1, 2, 3]));

        chai.assert.equal(list[0],     1, "list[0]");
        chai.assert.equal(list[1],     2, "list[1]");
        chai.assert.equal(list[2],     3, "list[2]");
        chai.assert.equal(list.length, 3, "list.length");
    }

    @test @shouldPass
    public createAndAdd(): void
    {
        const list = new List<number>();
        list.add(1);

        chai.assert.equal(list[0],     1, "step 1 - list[0]");
        chai.assert.equal(list.length, 1, "step 1 - list.length");

        list.add(2);

        chai.assert.equal(list[1],     2, "step 2 - list[1]");
        chai.assert.equal(list.length, 2, "step 2 - list.length");

        list.add(3);

        chai.assert.equal(list[2],     3, "step 3 - list[2]");
        chai.assert.equal(list.length, 3, "step 3 - list.length");
    }

    @test @shouldPass
    public createAndAddAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt(666, 1);

        chai.assert.equal(list[0],     1,   "step 1 - list[0]");
        chai.assert.equal(list[1],     666, "step 1 - list[1]");
        chai.assert.equal(list[2],     2,   "step 1 - list[2]");
        chai.assert.equal(list[3],     3,   "step 1 - list[3]");
        chai.assert.equal(list.length, 4,   "step 1 - list.length");

        list.addAt(555, 0);

        chai.assert.equal(list[0],     555, "step 2 - list[0]");
        chai.assert.equal(list[1],     1,   "step 2 - list[1]");
        chai.assert.equal(list[2],     666, "step 2 - list[2]");
        chai.assert.equal(list[3],     2,   "step 2 - list[3]");
        chai.assert.equal(list[4],     3,   "step 2 - list[4]");
        chai.assert.equal(list.length, 5,   "step 2 - list.length");

    }

    @test @shouldPass
    public createAndAddArrayAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt([555, 666, 777], 1);

        chai.assert.equal(list[0],     1,   "list[0]");
        chai.assert.equal(list[1],     555, "list[1]");
        chai.assert.equal(list[2],     666, "list[2]");
        chai.assert.equal(list[3],     777, "list[3]");
        chai.assert.equal(list[4],     2,   "list[4]");
        chai.assert.equal(list[5],     3,   "list[5]");
        chai.assert.equal(list.length, 6,   "list.length");

    }

    @test @shouldPass
    public createAndAddListAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt(new List([555, 666, 777]), 1);

        chai.assert.equal(list[0],     1,   "list[0]");
        chai.assert.equal(list[1],     555, "list[1]");
        chai.assert.equal(list[2],     666, "list[2]");
        chai.assert.equal(list[3],     777, "list[3]");
        chai.assert.equal(list[4],     2,   "list[4]");
        chai.assert.equal(list[5],     3,   "list[5]");
        chai.assert.equal(list.length, 6,   "list.length");
    }

    @test @shouldPass
    public createAndRemove(): void
    {
        const list = new List([1, 2, 3]);

        list.remove(1);

        chai.assert.equal(list[0],     1, "list[0]");
        chai.assert.equal(list[1],     3, "list[1]");
        chai.assert.equal(list.length, 2, "list.length");
    }

    @test @shouldPass
    public createAndRemoveByReference(): void
    {
        const one   = { value: 1 };
        const two   = { value: 2 };
        const three = { value: 3 };

        const list = new List([one, two, three]);

        list.remove(two);

        chai.assert.deepEqual(list[0], one,   "list[0]");
        chai.assert.deepEqual(list[1], three, "list[1]");
        chai.assert.equal(list.length, 2,     "list.length");
    }

    @test @shouldPass
    public createAndModifieValue(): void
    {
        const list = new List([1, 2, 3]);

        list[1] = 5;

        chai.assert.equal(list[0], 1, "list[0]");
        chai.assert.equal(list[1], 5, "list[1]");
        chai.assert.equal(list[2], 3, "list[2]");
        chai.assert.equal(list.length, 3, "list.length");
    }

    @test @shouldPass
    public listHasIndex(): void
    {
        chai.assert.isTrue(1 in new List([1, 2, 3]));
    }

    @test @shouldPass
    public listHasKey(): void
    {
        chai.assert.isTrue("length" in new List());
    }

    @test @shouldFail
    public getIndexLesserThanToLength(): void
    {
        chai.assert.throw(() => new List()[-1], ArgumentOutOfRangeError, "index is less than 0");
    }

    @test @shouldFail
    public getIndexGreatherOrEqualToLength(): void
    {
        chai.assert.throw(() => new List()[0], ArgumentOutOfRangeError, "index is equal to or greater than length");
    }

    @test @shouldFail
    public setIndexLesserThanToLength(): void
    {
        chai.assert.throw(() => new List()[-1] = 1, ArgumentOutOfRangeError, "index is less than 0");
    }

    @test @shouldFail
    public setIndexGreatherOrEqualToLength(): void
    {
        chai.assert.throw(() => new List()[0] = 1, ArgumentOutOfRangeError, "index is equal to or greater than length");
    }
}