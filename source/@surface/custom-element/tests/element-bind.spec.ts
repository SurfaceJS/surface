import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import ElementBind                             from "../internal/element-bind";

@suite
export default class ElementBindSpec
{
    @test @shouldPass
    public elementWithoutAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("span");

        ElementBind.for({ host }, content);
    }

    @test @shouldPass
    public elementWithAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span value='1'>Text</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            chai.expect(content.firstElementChild.getAttribute("value")).to.equal("1");
        }
    }

    @test @shouldPass
    public elementWithAttributesBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.lang = "pt-br";
        content.innerHTML = "<input type='text' lang='{{ host.lang }}' parent='{{ host.tagName }}'>Text</input>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            const span = content.firstElementChild as HTMLSpanElement;
            chai.expect(span.lang).to.equal("pt-br");
            chai.expect(span.getAttribute("lang")).to.equal("pt-br");
            chai.expect(span.getAttribute("parent")).to.equal("DIV");

            span.lang = "en-us";
            span.dispatchEvent(new Event("change"));
            chai.expect(host.lang).to.equal("en-us");

            span.setAttribute("lang", "pt-pt");
            chai.expect(host.lang).to.equal("pt-pt");

            span.lang = "pt-br";
            span.dispatchEvent(new Event("keyup"));
            chai.expect(host.lang).to.equal("pt-br");
        }
    }

    @test @shouldPass
    public elementWithAttributesBindInterpolation(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.lang = "pt-br";
        content.innerHTML = "<span data-text='Tag name: {{ host.tagName }}'>Text</span>";

        ElementBind.for({ host }, content);
        chai.expect(content.firstElementChild!.getAttribute("data-text")).to.equal("Tag name: DIV");
    }

    @test @shouldPass
    public elementWithAttributesBindToNonBindableField(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span foo='{{ host.tagName }}'</span>";

        const span = content.firstElementChild as HTMLSpanElement;

        span["foo"] = "";

        ElementBind.for({ host }, content);

        chai.expect(span["foo"]).to.equal("DIV");
    }

    @test @shouldPass
    public elementWithAttributesBindToWindowFallback(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span lang='{{ Node.name }}'</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            const span = content.firstElementChild as HTMLSpanElement;
            chai.expect(span.lang).to.equal("Node");
        }
    }

    @test @shouldPass
    public elementWithAttributesBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span has-childs='[[ this.childNodes.length > 0 ]]'></span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            chai.expect(content.firstElementChild.getAttribute("has-childs")).to.equal("false");
        }
    }

    @test @shouldPass
    public elementWithPropertyAttributeBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span id='{{ this.childNodes.length > 0 }}'></span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            const span = content.firstElementChild;

            chai.expect(span.getAttribute("id")).to.equal("false");
            chai.expect(span.id).to.equal("false");
        }
    }

    @test @shouldPass
    public elementWithAttributesWithEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.click = () => chai.expect(true).to.equal(true);

        content.innerHTML = "<span on-click='{{ host.click }}'>Text</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            content.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public elementWithAttributesWithExpressionEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host["method"] = (value: boolean) => chai.expect(value).to.equal(true);

        content.innerHTML = "<span on-click='{{ host.method(true) }}'>Text</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            content.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public elementWithTextNodeNonInitilizedBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span>{{ host.foo }}</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            chai.expect(content.firstElementChild.innerHTML).to.equal("");
        }
    }

    @test @shouldPass
    public elementWithTextNodeBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.id = "01";
        content.innerHTML = "<span>Host id: {{ host.id }}</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            chai.expect(content.firstElementChild.innerHTML).to.equal("Host id: 01");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            chai.expect(content.firstElementChild.innerHTML).to.equal("Host id: 02");
        }
    }

    @test @shouldPass
    public elementWithTextNodeBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        host.id = "01";
        content.innerHTML = "<span>{{ host.id == '01' }}</span>";

        ElementBind.for({ host }, content);

        if (content.firstElementChild)
        {
            chai.expect(content.firstElementChild.innerHTML).to.equal("true");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            chai.expect(content.firstElementChild.innerHTML).to.equal("false");
        }
    }

    @test @shouldFail
    public elementWithInvalidBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("div");

        content.innerHTML = "<span>Host tag name: {{ host.? }}</span>";

        try
        {
            ElementBind.for({ host }, content);
        }
        catch (error)
        {
            chai.expect(error).to.includes(new Error("Unexpected token ? - posistion 6"));
        }
    }
}