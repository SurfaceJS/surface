import { before, category, suite, test } from "@surface/test-suite";
import { expect }                        from "chai";
import { JSDOM }                         from "jsdom";
import DataBind                          from "../internal/data-bind";

@suite("Data bind")
export default class DataBindSpec
{
    @before("Mock dom")
    public before(): void
    {
        let window       = new JSDOM().window;
        global["window"] = window;
        global["Node"]   = window.Node;
        global["Event"]  = window.Event;
    }

    @category("Should work")
    @test("Element without attributes")
    public async elementWithoutAttributes(): Promise<void>
    {
        const document = window.document;
        const host     = document.createElement("div");
        const content  = document.createElement("span");

        await DataBind.for(host, content);
    }

    @category("Should work")
    @test("Element with attributes")
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

    @category("Should work")
    @test("Element with attributes bind")
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

    @category("Should work")
    @test("Element with attributes with event bind")
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

    @category("Should work")
    @test("Element with text node bind")
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

    @category("Should throw")
    @test("Element with invalid bind expression")
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