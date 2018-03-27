import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import DataBind                                from "../internal/data-bind";

@suite
export default class DataBindSpec
{
    @test @shouldPass
    public async elementWithoutAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("span");

        await DataBind.for(host, content);
    }

    @test @shouldPass
    public async elementWithAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span value='1'>Text</span>";

        await DataBind.for(host, content);

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

        await DataBind.for(host, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.getAttribute("lang")).to.equal("pt-br");
            expect(content.firstElementChild.getAttribute("parent")).to.equal("DIV");
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

        await DataBind.for(host, content);

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

        content.innerHTML = "<span>Host tag name: {{ host.tagName }}</span>";

        await DataBind.for(host, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.innerHTML).to.equal("Host tag name: DIV");
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
            await DataBind.for(host, content);
        }
        catch (error)
        {
            expect(error).to.includes(new Error("Unexpected token ? - posistion 6"));
        }
    }
}