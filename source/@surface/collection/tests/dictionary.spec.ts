import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Dictionary                  from "../internal/dictionary.js";
import KeyValuePair                from "../internal/key-value-pair.js";

@suite
export default class ListSpec
{
    @test @shouldPass
    public createEmpty(): void
    {
        expect(() => new Dictionary<string, object>()).to.not.throw();
    }

    @test @shouldPass
    public createFromObject(): void
    {
        expect(() => Dictionary.of({ a: 1, b: 2 })).to.not.throw();
    }

    @test @shouldPass
    public setEntry(): void
    {
        const dictionary = new Dictionary<string, number>();

        dictionary.set("one", 1);

        expect(dictionary.size).to.equal(1);
    }

    @test @shouldPass
    public getEntry(): void
    {
        const dictionary = Dictionary.of({ one: 1 });
        expect(dictionary.get("one")).to.equal(1);
    }

    @test @shouldPass
    public hasEntry(): void
    {
        const dictionary = Dictionary.of({ one: 1 });
        expect(dictionary.has("one")).to.equal(true);
    }

    @test @shouldPass
    public deleteEntry(): void
    {
        const dictionary = Dictionary.of({ one: 1 });

        expect(dictionary.size,       "step 1 - dictionary.size").to.equal(1);
        expect(dictionary.has("one"), "step 1 - dictionary.has('one')").to.equal(true);

        dictionary.delete("one");

        expect(dictionary.size,       "step 1 - dictionary.size").to.equal(0);
        expect(dictionary.has("one"), "step 2 - dictionary.has('one')").to.equal(false);
    }

    @test @shouldPass
    public iterateEntries(): void
    {
        expect(Dictionary.of({ one: 1 }).toArray()).to.deep.equal([new KeyValuePair("one", 1)]);
    }
}