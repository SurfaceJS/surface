
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import Observer                                from "../internal/observer.js";

@suite
export default class ObserverSpec
{
    @test @shouldPass
    public notify(): void
    {
        const target = { value: 1 };

        let value = 0;

        const observer = new Observer<number>(target, ["value"]);

        observer.subscribe(x => value = x);

        observer.notify();

        chai.assert.equal(value, 1);
    }

    @test @shouldFail
    public unsubscribe(): void
    {
        const target = { value: 1 };

        let value = 0;

        const observer = new Observer<number>(target, ["value"]);

        const listener = (x: number): number => value = x;

        observer.subscribe(listener);

        observer.notify();

        chai.assert.equal(value, 1);

        observer.unsubscribe(listener);

        target.value = 2;

        observer.notify();

        chai.assert.equal(value, 1);
    }

    @test @shouldFail
    public unsubscribeInvalidListener(): void
    {
        chai.assert.throws(() => new Observer({ }, []).unsubscribe(() => void 0), "Listerner not subscribed");
    }
}