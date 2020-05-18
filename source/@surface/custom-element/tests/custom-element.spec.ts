import "./fixtures/dom";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import MockElement                 from "./fixtures/mock-element";

@suite
export default class CustomElementSpec
{
    @test @shouldPass
    public construct(): void
    {
        assert.doesNotThrow(() => new MockElement());
    }
}