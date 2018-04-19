// tslint:disable:no-non-null-assertion
import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import MockElement                 from "./fixtures/mock-element";

@suite
export default class CustomElementSpc
{
    @test @shouldPass
    public construct(): void
    {
        expect(() => new MockElement()).to.not.throw();
    }

    @test @shouldPass
    public findElement(): void
    {
        const mock = new MockElement();
        expect(mock.find("span")).to.instanceof(HTMLElement);
    }

    @test @shouldPass
    public findElementInSlot(): void
    {
        const mock = new MockElement();
        expect(mock.findAll("span").toArray().length).to.equal(2);
    }
}