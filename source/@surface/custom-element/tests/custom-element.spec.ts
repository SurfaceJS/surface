import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { expect }                  from "chai";
import MockElement                 from "./fixtures/mock-element";

@suite
export default class CustomElementSpec
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
        expect(mock["shadowQuery"]("span")).to.instanceof(HTMLElement);
    }

    @test @shouldPass
    public findElementAll(): void
    {
        const mock = new MockElement();
        expect(mock["shadowQueryAll"]("span").toArray().length).to.equal(2);
    }
}