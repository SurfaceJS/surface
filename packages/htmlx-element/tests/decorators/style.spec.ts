// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import { styles }                  from "../../index.js";
import element                     from "../../internal/decorators/element.js";
import HTMLXElement                from "../../internal/htmlx-element.js";

@suite
export default class ElementDecoratorSpec
{
    @test @shouldPass
    public elementWithStyleDecorator(): void
    {
        @element(`mock-${crypto.randomUUID()}` as `${string}-${string}`, { style: "h1 { color: red }" })
        @styles("h2 { color: blue }")
        class Mock extends HTMLXElement
        { }

        const instance = new Mock();

        const adoptedStyleSheets = (instance.shadowRoot as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets!;

        assert.equal(adoptedStyleSheets.length, 2);
        assert.equal(adoptedStyleSheets[0]!.toString(), "h2 { color: blue }");
        assert.equal(adoptedStyleSheets[1]!.toString(), "h1 { color: red }");
    }
}
