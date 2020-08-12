
import { Indexer }                 from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import PropertyListener            from "../internal/property-listener";

@suite
export default class PropertyListenerSpec
{
    @test @shouldPass
    public notify(): void
    {
        const target = { host: { value: 1 } };

        const listener = new PropertyListener(target.host, "value");

        listener.notify(2);

        chai.expect(target.host.value).to.equal(2);
    }

    @test @shouldPass
    public update(): void
    {
        const target = { host: { value: 1 } };

        const listener = new PropertyListener(target.host, "value");

        listener.update(target.host);

        chai.expect((listener as object as Indexer).target).to.equal(target.host);

        listener.update({ value: 2 });

        chai.expect((listener as object as Indexer).target).to.not.equal(target.host);
    }
}