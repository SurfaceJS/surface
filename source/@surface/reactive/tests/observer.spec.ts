
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import Observer                                from "../internal/observer";

@suite
export default class ObserverSpec
{
    @test @shouldPass
    public notify(): void
    {
        let value = 0;
        const observer = new Observer<number>();

        observer.subscribe({ notify: x => value = x });

        observer.notify(1);

        assert.equal(value, 1);
    }

    @test @shouldFail
    public unsubscribe(): void
    {
        let value = 0;
        const observer = new Observer<number>();

        const listener = { notify: (x: number) => value = x };

        observer.subscribe(listener);

        observer.notify(1);

        assert.equal(value, 1);

        observer.unsubscribe(listener);

        observer.notify(2);

        assert.equal(value, 1);
    }

    @test @shouldFail
    public unsubscribeInvalidListener(): void
    {
        assert.throws(() => new Observer().unsubscribe({ notify: () => undefined }), "Listerner not subscribed");
    }
}