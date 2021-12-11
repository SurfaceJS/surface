// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
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

        chai.assert.isOk(instance);
    }

    @test @shouldPass
    public elementWithTemplateAndStyle(): void
    {
        @element(`x-mock-${crypto.randomUUID()}`, { style: "h1 { color: red }", template: "<h1>Hello World</h1>" })
        class Mock extends HTMLXElement
        { }

        const instance = new Mock();

        chai.assert.isOk(instance);
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

        chai.assert.isOk([Root, Host]); // Prevent unused warning.

        const root = new Root();
        const host = root.shadowRoot.firstElementChild as HTMLXElement;

        chai.assert.instanceOf(host.$listeners.click, Function);
        chai.assert.equal(Object.entries(host.$listeners).length, 1);
    }

    @test @shouldPass
    public getInjections(): void
    {
        const HASH = crypto.randomUUID();

        @element(`x-root-${HASH}`, { template: `<x-host-${HASH}><span #inject>Hello World!!!</span></x-host-${HASH}>` })
        class Root extends HTMLXElement
        { }

        @element(`x-host-${HASH}`)
        class Host extends HTMLXElement
        { }

        chai.assert.isOk([Root, Host]); // Prevent unused warning.

        const root = new Root();
        const host = root.shadowRoot.firstElementChild as HTMLXElement;

        chai.assert.instanceOf(host.$injections, Array);
        chai.assert.equal(host.$injections.length, 1);
        chai.assert.equal(host.$injections[0], "default");
    }
}