import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import * as chai                               from "chai";
import TemplateProcessor                        from "../internal/template-processor";

@suite
export default class DirectivesProcessorSpec
{
    @test @shouldPass
    public elementWithoutAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("span");

        TemplateProcessor.process(host, element, { });
    }

    @test @shouldPass
    public elementWithAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span value='1'>Text</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            chai.expect(element.firstElementChild.getAttribute("value")).to.equal("1");
        }
    }

    @test @shouldPass
    public elementWithAttributesBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.lang = "pt-br";
        element.innerHTML = "<input type='text' lang='{{ host.lang }}' parent='{{ host.tagName }}'>Text</input>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            const input = element.firstElementChild as HTMLSpanElement;
            chai.expect(input.lang).to.equal("pt-br");
            chai.expect(input.getAttribute("lang")).to.equal("pt-br");
            chai.expect(input.getAttribute("parent")).to.equal("DIV");

            input.lang = "en-us";
            input.dispatchEvent(new Event("input"));
            chai.expect(host.lang).to.equal("en-us");

            input.lang = "pt-br";
            input.dispatchEvent(new Event("input"));
            chai.expect(host.lang).to.equal("pt-br");
        }
    }

    @test @shouldPass
    public elementWithAttributesBindInterpolation(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.lang = "pt-br";
        element.innerHTML = "<span data-text='Tag name: {{ host.tagName }}'>Text</span>";

        TemplateProcessor.process(host, element, { });
        chai.expect(element.firstElementChild!.getAttribute("data-text")).to.equal("Tag name: DIV");
    }

    @test @shouldPass
    public elementWithAttributesBindToNonBindableField(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span foo='{{ host.tagName }}'</span>";

        const span = element.firstElementChild as HTMLSpanElement & { foo?: string };

        span.foo = "";

        TemplateProcessor.process(host, element, { });

        chai.expect(span.foo).to.equal("DIV");
    }

    @test @shouldPass
    public elementWithAttributesBindToWindowFallback(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span lang='{{ Node.name }}'</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            const span = element.firstElementChild as HTMLSpanElement;
            chai.expect(span.lang).to.equal("Node");
        }
    }

    @test @shouldPass
    public elementWithAttributesBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span has-childs='[[ this.childNodes.length > 0 ]]'></span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            chai.expect(element.firstElementChild.getAttribute("has-childs")).to.equal("false");
        }
    }

    @test @shouldPass
    public elementWithPropertyAttributeBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span id='{{ this.childNodes.length > 0 }}'></span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            const span = element.firstElementChild;

            chai.expect(span.getAttribute("id")).to.equal("false");
            chai.expect(span.id).to.equal("false");
        }
    }

    @test @shouldPass
    public elementWithAttributesWithEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.click = () => chai.expect(true).to.equal(true);

        element.innerHTML = "<span on-click='{{ host.click }}'>Text</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            element.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public elementWithAttributesWithExpressionEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div") as HTMLDivElement & { method?: Function };
        const element  = document.createElement("div");

        host.method = (value: boolean) => chai.expect(value).to.equal(true);

        element.innerHTML = "<span on-click='{{ host.method(true) }}'>Text</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            element.firstElementChild.dispatchEvent(new Event("click"));
        }
    }

    @test @shouldPass
    public elementWithTextNodeNonInitilizedBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span>{{ host.foo }}</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            chai.expect(element.firstElementChild.innerHTML).to.equal("");
        }
    }

    @test @shouldPass
    public elementWithTextNodeBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.id = "01";
        element.innerHTML = "<span>Host id: {{ host.id }}</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            chai.expect(element.firstElementChild.innerHTML).to.equal("Host id: 01");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            chai.expect(element.firstElementChild.innerHTML).to.equal("Host id: 02");
        }
    }

    @test @shouldPass
    public elementWithTextNodeBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.id = "01";
        element.innerHTML = "<span>{{ host.id == '01' }}</span>";

        TemplateProcessor.process(host, element, { });

        if (element.firstElementChild)
        {
            chai.expect(element.firstElementChild.innerHTML).to.equal("true");
            host.id = "02";
            host.dispatchEvent(new Event("change"));
            chai.expect(element.firstElementChild.innerHTML).to.equal("false");
        }
    }

    @test @shouldFail
    public elementWithInvalidBindExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span>Host tag name: {{ host.? }}</span>";

        try
        {
            TemplateProcessor.process(host, element, { });
        }
        catch (error)
        {
            chai.expect(error).to.includes(new Error("Unexpected token ? - posistion 6"));
        }
    }
}