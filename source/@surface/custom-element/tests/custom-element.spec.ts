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
}