import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import Observer                    from "../observer";

@suite
export default class ObserverSpec
{
    @test @shouldPass
    public create(): void
    {
        expect(() => new Observer()).to.not.throw();
    }

    @test @shouldPass
    public subscribeAndNotify(): void
    {
        let passed = false;

        const observer = new Observer();

        observer.subscribe(() => passed = true);
        observer.notify();

        expect(passed).to.equal(true);
    }

    @test @shouldPass
    public unsubscribeAndNotify(): void
    {
        let passed = false;

        const observer = new Observer();
        const action = () => passed = true;

        observer.subscribe(action);
        observer.unsubscribe(action);
        observer.notify();

        expect(passed).to.equal(false);
    }
}
