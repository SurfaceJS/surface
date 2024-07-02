// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";
import { painting } from "@surface/htmlx";

import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import element                     from "../internal/decorators/element.js";
import HTMLXElement                from "../internal/htmlx-element.js";

@suite
export default class HTMLXElementSpec
{
    @test @shouldPass
    public element(): void
    {
        @element(`x-mock-${crypto.randomUUID()}`)
        class Mock extends HTMLXElement
        { }

        const instance = new Mock();

        assert.isOk(instance);
    }

    @test @shouldPass
    public elementWithTemplateAndStyle(): void
    {
        @element(`x-mock-${crypto.randomUUID()}`, { style: "h1 { color: red }", template: "<h1>Hello World</h1>" })
        class Mock extends HTMLXElement
        { }

        const instance = new Mock();

        assert.isOk(instance);
    }

    @test @shouldPass
    public getListeners(): void
    {
        const HASH = crypto.randomUUID();

        @element(`x-root-${HASH}`, { template: `<x-host-${HASH} @click="host.title = 'clicked'"></x-host-${HASH}>` })
        class Root extends HTMLXElement
        { }

        @element(`x-host-${HASH}`)
        class Host extends HTMLXElement
        { }

        assert.isOk([Root, Host]); // Prevent unused warning.

        const root = new Root();
        const host = root.shadowRoot.firstElementChild as HTMLXElement;

        assert.instanceOf(host.$listeners.click, Function);
        assert.equal(Object.entries(host.$listeners).length, 1);
    }

    @test @shouldPass
    public async getInjections(): Promise<void>
    {
        const HASH = crypto.randomUUID();

        @element(`x-root-${HASH}`, { template: `<x-host-${HASH}><span #if="host.lang" #inject>Hello World!!!</span></x-host-${HASH}>` })
        class Root extends HTMLXElement
        { }

        @element(`x-host-${HASH}`, { template: "<div class='injected' #for='injection of host.$injections'></div>" })
        class Host extends HTMLXElement
        { }

        assert.isOk([Root, Host]); // Prevent unused warning.

        const root = new Root();
        const host = root.shadowRoot.firstElementChild as HTMLXElement;

        await painting();

        assert.equal(host.$injections.length, 0);

        root.lang = "pt-br";

        await painting();

        assert.equal(host.$injections.length, 1);
        assert.equal(host.$injections[0], "default");
        assert.equal(host.shadowRoot!.querySelectorAll(".injected").length, 1);
    }
}
