import { Indexer }                 from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import Reactor                     from "../internal/reactor";
import Observer                    from "../internal/observer";
import PropertyListener            from "../internal/property-listener";
import PropertySubscription        from "../internal/property-subscription";

@suite
export default class PropertySubscriptionSpec
{
    @test @shouldPass
    public unsubscribe(): void
    {
        const emitter = { value: 1 };
        const target  = { host: { value: 1 } };

        const reactor = Reactor.makeReactive(emitter, "value");

        const listener = new PropertyListener(target.host, "value");
        const observer = new Observer<number>();

        observer.subscribe(listener);

        const subscription = new PropertySubscription(listener, observer);

        reactor.observers.set("value", observer);
        reactor.setPropertySubscription("value", subscription);

        let unsubscribed = false;

        subscription.onUnsubscribe(() => unsubscribed = true);

        chai.expect(() => subscription.unsubscribe()).to.not.throw();
        chai.expect(unsubscribed).to.equal(true);
    }

    @test @shouldPass
    public update(): void
    {
        const target  = { host: { value: 1 } };

        const listener = new PropertyListener(target.host, "value");
        const observer = new Observer<number>();

        observer.subscribe(listener);

        const subscription = new PropertySubscription(listener, observer);

        subscription.update({ value: 2 });

        chai.expect((listener as unknown as Indexer)["target"]).to.not.deep.equal(target.host);
    }
}