import { ArgumentOutOfRangeError }             from "@surface/core";
import Enumerable                              from "@surface/enumerable";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import List                                    from "../internal/list";

@suite
export default class ListSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        expect(new List().length).to.equal(0);
    }

    @test @shouldPass
    public createFromArray(): void
    {
        const list = new List([1, 2, 3]);

        expect(list[0],     "list[0]").to.equal(1);
        expect(list[1],     "list[1]").to.equal(2);
        expect(list[2],     "list[2]").to.equal(3);
        expect(list.length, "list.length").to.equal(3);
    }

    @test @shouldPass
    public createFromIterable(): void
    {
        const list = new List(Enumerable.from([1, 2, 3]));

        expect(list[0],     "list[0]").to.equal(1);
        expect(list[1],     "list[1]").to.equal(2);
        expect(list[2],     "list[2]").to.equal(3);
        expect(list.length, "list.length").to.equal(3);
    }

    @test @shouldPass
    public createAndAdd(): void
    {
        const list = new List<number>();
        list.add(1);

        expect(list[0],     "step 1 - list[0]").to.equal(1);
        expect(list.length, "step 1 - list.length").to.equal(1);

        list.add(2);

        expect(list[1],     "step 2 - list[1]").to.equal(2);
        expect(list.length, "step 2 - list.length").to.equal(2);

        list.add(3);

        expect(list[2],     "step 3 - list[2]").to.equal(3);
        expect(list.length, "step 3 - list.length").to.equal(3);
    }

    @test @shouldPass
    public createAndAddAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt(666, 1);

        expect(list[0],     "step 1 - list[0]").to.equal(1);
        expect(list[1],     "step 1 - list[1]").to.equal(666);
        expect(list[2],     "step 1 - list[2]").to.equal(2);
        expect(list[3],     "step 1 - list[3]").to.equal(3);
        expect(list.length, "step 1 - list.length").to.equal(4);

        list.addAt(555, 0);

        expect(list[0],     "step 2 - list[0]").to.equal(555);
        expect(list[1],     "step 2 - list[1]").to.equal(1);
        expect(list[2],     "step 2 - list[2]").to.equal(666);
        expect(list[3],     "step 2 - list[3]").to.equal(2);
        expect(list[4],     "step 2 - list[4]").to.equal(3);
        expect(list.length, "step 2 - list.length").to.equal(5);

    }

    @test @shouldPass
    public createAndAddArrayAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt([555, 666, 777], 1);

        expect(list[0],     "list[0]").to.equal(1);
        expect(list[1],     "list[1]").to.equal(555);
        expect(list[2],     "list[2]").to.equal(666);
        expect(list[3],     "list[3]").to.equal(777);
        expect(list[4],     "list[4]").to.equal(2);
        expect(list[5],     "list[5]").to.equal(3);
        expect(list.length, "list.length").to.equal(6);

    }

    @test @shouldPass
    public createAndAddListAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt(new List([555, 666, 777]), 1);

        expect(list[0],     "list[0]").to.equal(1);
        expect(list[1],     "list[1]").to.equal(555);
        expect(list[2],     "list[2]").to.equal(666);
        expect(list[3],     "list[3]").to.equal(777);
        expect(list[4],     "list[4]").to.equal(2);
        expect(list[5],     "list[5]").to.equal(3);
        expect(list.length, "list.length").to.equal(6);
    }

    @test @shouldPass
    public createAndRemove(): void
    {
        const list = new List([1, 2, 3]);

        list.remove(1);

        expect(list[0],     "list[0]").to.equal(1);
        expect(list[1],     "list[1]").to.equal(3);
        expect(list.length, "list.length").to.equal(2);
    }

    @test @shouldPass
    public createAndRemoveByReference(): void
    {
        const one   = { value: 1 };
        const two   = { value: 2 };
        const three = { value: 3 };

        const list = new List([one, two, three]);

        list.remove(two);

        expect(list[0],     "list[0]").to.deep.equal(one);
        expect(list[1],     "list[1]").to.deep.equal(three);
        expect(list.length, "list.length").to.equal(2);
    }

    @test @shouldPass
    public createAndModifieValue(): void
    {
        const list = new List([1, 2, 3]);

        list[1] = 5;

        expect(list[0],     "list[0]").to.deep.equal(1);
        expect(list[1],     "list[1]").to.deep.equal(5);
        expect(list[2],     "list[2]").to.deep.equal(3);
        expect(list.length, "list.length").to.equal(3);
    }

    @test @shouldPass
    public listHasIndex(): void
    {
        expect(1 in new List([1, 2, 3])).to.equal(true);
    }

    @test @shouldPass
    public listHasKey(): void
    {
        expect("length" in new List()).to.equal(true);
    }

    @test @shouldFail
    public getIndexLesserThanToLength(): void
    {
        expect(() => new List()[-1]).to.throw(ArgumentOutOfRangeError, "index is less than 0");
    }

    @test @shouldFail
    public getIndexGreatherOrEqualToLength(): void
    {
        expect(() => new List()[0]).to.throw(ArgumentOutOfRangeError, "index is equal to or greater than length");
    }

    @test @shouldFail
    public setIndexLesserThanToLength(): void
    {
        expect(() => new List()[-1] = 1).to.throw(ArgumentOutOfRangeError, "index is less than 0");
    }

    @test @shouldFail
    public setIndexGreatherOrEqualToLength(): void
    {
        expect(() => new List()[0] = 1).to.throw(ArgumentOutOfRangeError, "index is equal to or greater than length");
    }
}