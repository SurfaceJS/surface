
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import Observer                                from "../observer";

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

        chai.expect(value).to.equal(1);
    }

    @test @shouldFail
    public unsubscribe(): void
    {
        let value = 0;
        const observer = new Observer<number>();

        const listener = { notify: (x: number) => value = x };

        observer.subscribe(listener);

        observer.notify(1);

        chai.expect(value).to.equal(1);

        observer.unsubscribe(listener);

        observer.notify(2);

        chai.expect(value).to.equal(1);
    }
}