import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { expect }                              from "chai";
import ElementBind                             from "../internal/element-bind";

@suite
export default class ElementBindSpec
{
    @test @shouldPass
    public async elementWithoutAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("span");

        await ElementBind.for({ host }, content);
    }

    @test @shouldPass
    public async elementWithAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span value='1'>Text</span>";

        await ElementBind.for({ host }, content);

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

        await ElementBind.for({ host }, content);

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

            span.lang = "pt-br";
            span.dispatchEvent(new Event("keyup"));
            expect(host.lang).to.equal("pt-br");
        }
    }

    @test @shouldPass
    public async elementWithAttributesBindInterpolation(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.lang = "pt-br";
        content.innerHTML = "<span data-text='Tag name: {{ host.tagName }}'>Text</span>";

        await ElementBind.for({ host }, content);
        expect(content.firstElementChild!.getAttribute("data-text")).to.equal("Tag name: DIV");
    }

    @test @shouldPass
    public async elementWithAttributesBindToNonBindableField(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span foo='{{ host.tagName }}'</span>";

        const span = content.firstElementChild as HTMLSpanElement;

        span["foo"] = "";

        await ElementBind.for({ host }, content);

        expect(span["foo"]).to.equal("DIV");
    }

    @test @shouldPass
    public async elementWithAttributesBindToWindowFallback(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span lang='{{ Node.name }}'</span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            const span = content.firstElementChild as HTMLSpanElement;
            expect(span.lang).to.equal("Node");
        }
    }

    @test @shouldPass
    public async elementWithAttributesBindExpression(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span has-childs='[[ this.childNodes.length > 0 ]]'></span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.getAttribute("has-childs")).to.equal("false");
        }
    }

    @test @shouldPass
    public async elementWithPropertyAttributeBindExpression(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span id='{{ this.childNodes.length > 0 }}'></span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            const span = content.firstElementChild;

            expect(span.getAttribute("id")).to.equal("false");
            expect(span.id).to.equal("false");
        }
    }

    @test @shouldPass
    public async elementWithAttributesWithEventBind(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.click = () => expect(true).to.equal(true);

        content.innerHTML = "<span on-click='{{ host.click }}'>Text</span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            content.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public async elementWithAttributesWithExpressionEventBind(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host["method"] = (value: boolean) => expect(value).to.equal(true);

        content.innerHTML = "<span on-click='{{ host.method(true) }}'>Text</span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            content.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public async elementWithTextNodeNonInitilizedBind(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span>{{ host.foo }}</span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.innerHTML).to.equal("");
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

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.innerHTML).to.equal("Host id: 01");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            expect(content.firstElementChild.innerHTML).to.equal("Host id: 02");
        }
    }

    @test @shouldPass
    public async elementWithTextNodeBindExpression(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.id = "01";
        content.innerHTML = "<span>{{ host.id == '01' }}</span>";

        await ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            expect(content.firstElementChild.innerHTML).to.equal("true");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            expect(content.firstElementChild.innerHTML).to.equal("false");
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
            await ElementBind.for({ host }, content);
        }
        catch (error)
        {
            expect(error).to.includes(new Error("Unexpected token ? - posistion 6"));
        }
    }
}