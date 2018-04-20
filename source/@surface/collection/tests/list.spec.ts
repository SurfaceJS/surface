import { Enumerable }              from "@surface/enumerable";
import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import List                        from "../list";

@suite
export default class ListSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        expect(new List().length).to.equal(0);
    }

    @test @shouldPass
    public createEmptyFromArray(): void
    {
        const list = new List([1, 2, 3]);

        expect(list.item(0), "list.item(0)").to.equal(1);
        expect(list.item(1), "list.item(1)").to.equal(2);
        expect(list.item(2), "list.item(2)").to.equal(3);
        expect(list.length , "list.length").to.equal(3);
    }

    @test @shouldPass
    public createEmptyFromEnumerable(): void
    {
        const list = new List(Enumerable.from([1, 2, 3]));

        expect(list.item(0), "list.item(0)").to.equal(1);
        expect(list.item(1), "list.item(1)").to.equal(2);
        expect(list.item(2), "list.item(2)").to.equal(3);
        expect(list.length , "list.length").to.equal(3);
    }

    @test @shouldPass
    public createAndAdd(): void
    {
        const list = new List<number>();
        list.add(1);

        expect(list.item(0), "step 1 - list.item(0)").to.equal(1);
        expect(list.length , "step 1 - list.length").to.equal(1);

        list.add(2);

        expect(list.item(1), "step 2 - list.item(1)").to.equal(2);
        expect(list.length , "step 2 - list.length").to.equal(2);

        list.add(3);

        expect(list.item(2), "step 3 - list.item(2)").to.equal(3);
        expect(list.length , "step 3 - list.length").to.equal(3);
    }

    @test @shouldPass
    public createAndAddAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt(666, 1);

        expect(list.item(0), "step 1 - list.item(0)").to.equal(1);
        expect(list.item(1), "step 1 - list.item(1)").to.equal(666);
        expect(list.item(2), "step 1 - list.item(2)").to.equal(2);
        expect(list.item(3), "step 1 - list.item(3)").to.equal(3);
        expect(list.length,  "step 1 - list.length").to.equal(4);

        list.addAt(555, 0);

        expect(list.item(0), "step 2 - list.item(0)").to.equal(555);
        expect(list.item(1), "step 2 - list.item(1)").to.equal(1);
        expect(list.item(2), "step 2 - list.item(2)").to.equal(666);
        expect(list.item(3), "step 2 - list.item(3)").to.equal(2);
        expect(list.item(4), "step 2 - list.item(4)").to.equal(3);
        expect(list.length,  "step 2 - list.length").to.equal(5);

    }

    @test @shouldPass
    public createAndAddArrayAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt([555, 666, 777], 1);

        expect(list.item(0), "list.item(0)").to.equal(1);
        expect(list.item(1), "list.item(1)").to.equal(555);
        expect(list.item(2), "list.item(2)").to.equal(666);
        expect(list.item(3), "list.item(3)").to.equal(777);
        expect(list.item(4), "list.item(4)").to.equal(2);
        expect(list.item(5), "list.item(5)").to.equal(3);
        expect(list.length,  "list.length").to.equal(6);

    }

    @test @shouldPass
    public createAndAddListAt(): void
    {
        const list = new List<number>();
        list.add(1);
        list.add(2);
        list.add(3);

        list.addAt(new List([555, 666, 777]), 1);

        expect(list.item(0), "list.item(0)").to.equal(1);
        expect(list.item(1), "list.item(1)").to.equal(555);
        expect(list.item(2), "list.item(2)").to.equal(666);
        expect(list.item(3), "list.item(3)").to.equal(777);
        expect(list.item(4), "list.item(4)").to.equal(2);
        expect(list.item(5), "list.item(5)").to.equal(3);
        expect(list.length,  "list.length").to.equal(6);
    }

    @test @shouldPass
    public createAndRemove(): void
    {
        const list = new List([1, 2, 3]);

        list.remove(1);

        expect(list.item(0), "list.item(0)").to.equal(1);
        expect(list.item(1), "list.item(1)").to.equal(3);
        expect(list.length , "list.length").to.equal(2);
    }

    @test @shouldPass
    public createAndRemoveByReference(): void
    {
        const one   = { value: 1 };
        const two   = { value: 2 };
        const three = { value: 3 };

        const list = new List([one, two, three]);

        list.remove(two);

        expect(list.item(0), "list.item(0)").to.deep.equal(one);
        expect(list.item(1), "list.item(1)").to.deep.equal(three);
        expect(list.length , "list.length").to.equal(2);
    }
}