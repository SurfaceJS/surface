import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import ElementBind                             from "../internal/element-bind";

@suite
export default class DataBindSpec
{
    @test @shouldPass
    public async elementWithoutAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("span");

        await ElementBind.for(host, content);
    }

    @test @shouldPass
    public async elementWithAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span value='1'>Text</span>";

        await ElementBind.for(host, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.getAttribute("value")).to.equal("1");
        }
    }

    @test @shouldPass
    public async elementWithAttributesBind(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.lang = "pt-br";
        content.innerHTML = "<span lang='{{ host.lang }}' parent='{{ host.tagName }}'>Text</span>";

        await ElementBind.for(host, content);

        if (content.firstElementChild)
        {
            const span = content.firstElementChild as HTMLSpanElement;
            expect(span.lang).to.equal("pt-br");
            expect(span.getAttribute("lang")).to.equal("pt-br");
            expect(span.getAttribute("parent")).to.equal("DIV");

            span.lang = "en-us";
            span.dispatchEvent(new Event("change"));
            expect(host.lang).to.equal("en-us");

            span.setAttribute("lang", "pt-pt");
            expect(host.lang).to.equal("pt-pt");
        }
    }

    @test @shouldPass
    public async elementWithAttributesBindExpression(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.lang = "pt-br";
        content.innerHTML = "<span has-childs='{{ this.childNodes.length > 0 }}'></span>";

        await ElementBind.for(host, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.getAttribute("has-childs")).to.equal("false");
        }
    }

    @test @shouldPass
    public async elementWithAttributesWithEventBind(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.click = () => expect(true);

        content.innerHTML = "<span on-click='{{ host.click }}'>Text</span>";

        await ElementBind.for(host, content);

        if (content.firstElementChild)
        {
            content.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public async elementWithTextNodeBind(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.id = "01";
        content.innerHTML = "<span>Host id: {{ host.id }}</span>";

        await ElementBind.for(host, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.innerHTML).to.equal("Host id: 01");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            expect(content.firstElementChild.innerHTML).to.equal("Host id: 02");
        }
    }

    @test @shouldFail
    public async elementWithInvalidBindExpression(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span>Host tag name: {{ host.? }}</span>";

        try
        {
            await ElementBind.for(host, content);
        }
        catch (error)
        {
            expect(error).to.includes(new Error("Unexpected token ? - posistion 6"));
        }
    }
}