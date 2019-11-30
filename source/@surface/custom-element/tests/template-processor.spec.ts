import "./fixtures/dom";

import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import chai                                    from "chai";
import { ON_PROCESS, PROCESSED }               from "../internal/symbols";
import TemplateProcessor                       from "../internal/template-processor";
import { Bindable }                            from "../internal/types";

const render = async (interval?: number) => await new Promise(resolve => setTimeout(resolve, interval ?? 0));

@suite
export default class TemplateProcessorSpec
{
    @test @shouldPass
    public elementWithoutAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("span");

        TemplateProcessor.process(host, element);
    }

    @test @shouldPass
    public elementWithAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span value='1'>Text</span>";

        TemplateProcessor.process(host, element);

        if (element.firstElementChild)
        {
            chai.expect(element.firstElementChild.getAttribute("value")).to.equal("1");
        }
    }

    @test @shouldPass
    public elementWithAttributeInterpolation(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.lang = "pt-br";
        element.innerHTML = "<input type='text' lang='{host.lang}' parent='{host.tagName}'>Text</input>";

        TemplateProcessor.process(host, element);

        if (element.firstElementChild)
        {
            const input = element.firstElementChild as HTMLSpanElement;
            chai.expect(input.lang).to.equal("pt-br");
            chai.expect(input.getAttribute("lang")).to.equal("pt-br");
            chai.expect(input.getAttribute("parent")).to.equal("DIV");

            host.lang = "en-us";
            chai.expect(input.lang).to.equal("en-us");
            chai.expect(input.getAttribute("lang")).to.equal("en-us");
        }
    }

    @test @shouldPass
    public elementWithAttributeCompoundInterpolation(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.lang = "pt-br";
        element.innerHTML = "<span data-text='Tag lang: {host.lang}'>Text</span>";

        TemplateProcessor.process(host, element);

        chai.expect(element.firstElementChild!.getAttribute("data-text")).to.equal("Tag lang: pt-br");

        host.lang = "en-us";

        chai.expect(element.firstElementChild!.getAttribute("data-text")).to.equal("Tag lang: en-us");
    }

    @test @shouldPass
    public elementWithAttributeInterpolationExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span has-childs='Has childs: {this.childNodes.length > 0}'></span>";

        TemplateProcessor.process(host, element);

        chai.expect(element.firstElementChild!.getAttribute("has-childs")).to.equal("Has childs: false");
    }

    @test @shouldPass
    public elementWithOneWayDataBinding(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span :foo='host.tagName'</span>";

        const span = element.firstElementChild as HTMLSpanElement & { foo?: string };

        span.foo = "";

        TemplateProcessor.process(host, element);

        chai.expect(span.foo).to.equal("DIV");
    }

    @test @shouldPass
    public elementWithOneWayDataBindingToWindowFallback(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span lang='{Node.name}'</span>";

        TemplateProcessor.process(host, element);

        const span = element.firstElementChild as HTMLSpanElement;

        chai.expect(span.lang).to.equal("Node");
    }

    @test @shouldPass
    public elementWithTwoWayDataBinding(): void
    {
        const document = window.document;
        const host     = document.createElement("div") as HTMLDivElement & { value?: string };
        const element  = document.createElement("div");

        element.innerHTML = "<span ::value='host.value'</span>";

        const span = element.firstElementChild as HTMLSpanElement & { value?: string };

        host.value = "";
        span.value = "";

        TemplateProcessor.process(host, element);

        host.value = "foo";

        chai.expect(span.value).to.equal("foo");

        span.value = "foo";

        chai.expect(host.value).to.equal("foo");
    }

    // @test @shouldPass
    // public async customElementWithTwoWayDataBinding(): Promise<void>
    // {
    //     const document = window.document;
    //     const host     = document.createElement("div") as HTMLDivElement & { value?: string };
    //     const element  = new MockParent();

    //     const postProcessing = (TemplateProcessor as Indexer).postProcessing as Map<Node, Array<Action>>;

    //     const action = Array.from(postProcessing.values())[0];

    //     postProcessing.clear();

    //     postProcessing.set()

    //     TemplateProcessor.process(host, element);

    //     await render();

    //     chai.expect(host.value).to.equal(0);
    // }

    @test @shouldPass
    public elementWithAttributesWithEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        let clicked = false;

        host.click = () => clicked = true;

        element.innerHTML = "<span on:click='host.click'>Text</span>";

        TemplateProcessor.process(host, element);

        element.firstElementChild!.dispatchEvent(new Event("click"));

        chai.expect(clicked).to.equal(true);
    }

    @test @shouldPass
    public elementWithAttributesWithExpressionEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div") as HTMLDivElement & { method?: Function };
        const element  = document.createElement("div");

        let clicked = false;

        host.method = (value: boolean) => clicked = value;

        element.innerHTML = "<span on:click='host.method(true)'>Text</span>";

        TemplateProcessor.process(host, element);

        element.firstElementChild!.dispatchEvent(new Event("click"));

        chai.expect(clicked).to.equal(true);
    }

    @test @shouldPass
    public elementWithTextNodeInterpolation(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.id = "01";
        element.innerHTML = "<span>Host id: {host.id}</span>";

        TemplateProcessor.process(host, element);

        chai.expect(element.firstElementChild!.innerHTML).to.equal("Host id: 01");

        host.id = "02";

        chai.expect(element.firstElementChild!.innerHTML).to.equal("Host id: 02");
    }

    @test @shouldPass
    public elementWithTextNodeInterpolationExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.id = "01";
        element.innerHTML = "<span>{host.id == '01'}</span>";

        TemplateProcessor.process(host, element);

        chai.expect(element.firstElementChild!.innerHTML).to.equal("true");

        host.id = "02";

        chai.expect(element.firstElementChild!.innerHTML).to.equal("false");
    }

    @test @shouldPass
    public async templateWithoutDirective(): Promise<void>
    {
        const root = document.createElement("div");
        const host = document.createElement("div");

        host.innerHTML = "<template>World</template>";

        const element = document.createElement("div");

        root.appendChild(host);
        host.appendChild(element);

        element.innerHTML = "<span>Hello </span><span>!!!</span>";

        TemplateProcessor.process(host, element);
        TemplateProcessor.process(root, host);

        await render();

        chai.expect(host.innerHTML).to.equal("<template>World</template><div><span>Hello </span><span>!!!</span></div>");
    }

    @test @shouldPass
    public async templateWithInjectDirective(): Promise<void>
    {
        const root = document.createElement("div");
        const host = document.createElement("div");

        host.innerHTML = "<template #inject:items>World</template>";

        (host as Bindable<Node>)[ON_PROCESS] = () => "Just coverage";

        const element = document.createElement("div");

        root.appendChild(host);
        host.appendChild(element);

        element.innerHTML = "<span>Hello </span><template #injector:items></template><span>!!!</span>";

        TemplateProcessor.process(host, element);
        TemplateProcessor.process(root, host);

        await render();

        chai.expect(root.querySelector("div")?.textContent).to.equal("Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndScopeDirective(): Promise<void>
    {
        const root = document.createElement("div");
        const host = document.createElement("div") as HTMLDivElement & { item?: { value: string } };

        host.item = { value: "People" };

        host.innerHTML = "<template #inject:item='{ item }'>{item.value}</template>";

        const element = document.createElement("div");

        root.appendChild(host);
        host.appendChild(element);

        element.innerHTML = "<span>Hello </span><template #injector:item='{ item: host.item }'></template><span>!!!</span>";

        TemplateProcessor.process(host, element);
        TemplateProcessor.process(root, host);

        await render();

        chai.expect(root.querySelector("div")?.textContent).to.equal("Hello People!!!");

        host.item = { value: "World" };

        await render();

        chai.expect(root.querySelector("div")?.textContent).to.equal("Hello World!!!");

        element.innerHTML = "";

        host.item = { value: "" };

        chai.expect(element.childNodes.length).to.equal(0);
    }

    @test @shouldPass
    public async templateWithInjectorDirectiveWithDefault(): Promise<void>
    {
        const root = document.createElement("div");
        const host = document.createElement("div");

        const element = document.createElement("div");

        root.appendChild(host);
        host.appendChild(element);

        element.innerHTML = "<span>Hello </span><template #injector:items>Default</template><span>!!!</span>";

        TemplateProcessor.process(host, element);
        TemplateProcessor.process(root, host);

        await render();

        chai.expect(root.querySelector("div")?.textContent).to.equal("Hello Default!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndConditionalDirectives(): Promise<void>
    {
        const host    = document.createElement("div") as HTMLDivElement & { [PROCESSED]?: boolean, condition?: boolean, items?: Array<[string, number, boolean]> };
        const content = document.createElement("div");

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value, visible] }" #if="visible">
                <span>{key}: {value}</span>
            </template>
        `;

        content.innerHTML =
        `
            <template #for="const item of host.items" #injector:items="{ item }">
                <span>Default</span>
            </template>
        `;

        host.appendChild(content);

        host.condition = false;
        host.items     = [];

        TemplateProcessor.process(host, content);

        await render();

        chai.expect(host.querySelector("span")).to.equal(null);

        host[PROCESSED] = true;

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, true],
            ["Three", 3, true]
        ];

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("One: 1");
        chai.expect(host.querySelector("span:nth-child(2)")?.textContent).to.equal("Two: 2");
        chai.expect(host.querySelector("span:nth-child(3)")?.textContent).to.equal("Three: 3");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, false],
            ["Three", 3, true]
        ];

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("One: 1");
        chai.expect(host.querySelector("span:nth-child(2)")?.textContent).to.equal("Three: 3");
    }

    @test @shouldPass
    public async templateWithInjectAndInjectorDirectives(): Promise<void>
    {
        const host    = document.createElement("div") as HTMLDivElement & { [PROCESSED]?: boolean, item?: [string, number] };
        const content1 = document.createElement("div");
        const content2 = document.createElement("div");

        host.innerHTML =
        `
            <template #inject:items1="{ item }">
                <span>{item[0]}: {item[1]}</span>
            </template>
        `;

        content1.innerHTML =
        `
            <template #inject:items2="{ item }" #injector:items1="{ item }">
                <span>Injector 1</span>
            </template>
        `;

        content2.innerHTML =
        `
            <template #injector:items2="{ item: host.item }">
                <span>Injector 2</span>
            </template>
        `;

        content1.normalize();
        content2.normalize();

        content1.appendChild(content2);

        host.appendChild(content1);

        host.normalize();

        host[PROCESSED] = true;

        host.item = ["Value", 1];

        TemplateProcessor.process(host, content1);

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("Value: 1");
    }

    @test @shouldPass
    public async templateWithConditionalDirective(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { order?: number };

        host.order = 1;

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #if="host.order == 1"><span>First</span></template><template>Ignore me</template>>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.firstElementChild?.textContent).to.equal("First");

        host.order = 2;

        await render();

        chai.expect(element.firstElementChild?.textContent).to.equal("");

        element.innerHTML = "";

        host.order = 0;

        chai.expect(element.childNodes.length).to.equal(0);
    }

    @test @shouldPass
    public async templateWithMultiplesConditionalDirective(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { order?: number };

        host.order = 1;

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #if="host.order == 1">First</template><template #else-if="host.order == 2">Second</template><template #else>Last</template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childNodes[1].textContent).to.equal("First");

        host.order = 2;

        await render();

        chai.expect(element.childNodes[1].textContent).to.equal("Second");

        host.order = 3;

        await render();

        chai.expect(element.childNodes[1].textContent).to.equal("Last");

        element.innerHTML = "";

        host.order = 0;

        chai.expect(element.childNodes.length).to.equal(0);
    }

    @test @shouldPass
    public async templateWithForInLoopDirective(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<number> };

        host.elements = [1];

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="const index in host.elements"><span>Element: {index}</span></template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 0");

        host.elements = [1, 2];

        await render();

        chai.expect(element.childElementCount).to.equal(2);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 0");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 1");

        host.elements = [1, 2, 3];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 0");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 1");
        chai.expect(element.childNodes[8].textContent).to.equal("Element: 2");

        host.elements = [2];

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 0");
    }

    @test @shouldPass
    public async templateWithForOfLoopDirective(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<number> };

        host.elements = [1];

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="const index of host.elements"><span>Element: {index}</span></template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 1");

        host.elements = [1, 2];

        await render();

        chai.expect(element.childElementCount).to.equal(2);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 1");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 2");

        host.elements = [1, 2, 3];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 1");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 2");
        chai.expect(element.childNodes[8].textContent).to.equal("Element: 3");

        host.elements = [2];

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 2");

        host.elements = [1, 2, 3];

        await render();

        host.elements = [3, 2, 1];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 3");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 2");
        chai.expect(element.childNodes[8].textContent).to.equal("Element: 1");

        element.innerHTML = "";

        host.elements = [];

        chai.expect(element.childNodes.length).to.equal(0);
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuring(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<[number, number]> };

        host.elements = [[1, 2]];

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="const [index0, index1] of host.elements"><span>Element[0]: {index0}, Element[1]: {index1}</span></template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");

        host.elements = [[1, 2], [2, 4]];

        await render();

        chai.expect(element.childElementCount).to.equal(2);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");
        chai.expect(element.childNodes[5].textContent).to.equal("Element[0]: 2, Element[1]: 4");

        host.elements = [[1, 2], [2, 4], [3, 6]];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");
        chai.expect(element.childNodes[5].textContent).to.equal("Element[0]: 2, Element[1]: 4");
        chai.expect(element.childNodes[8].textContent).to.equal("Element[0]: 3, Element[1]: 6");

        host.elements = [[2, 4]];

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 2, Element[1]: 4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuringDeepNested(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<[number, { item: { name: string } }]> };

        host.elements = [[1, { item: { name: "one" } }]];

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="const [index, { item: { name } }] of host.elements"><span>Element: {index}, Name: {name}</span></template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 1, Name: one");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }]
        ];

        await render();

        chai.expect(element.childElementCount).to.equal(2);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 1, Name: one");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 2, Name: two");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }],
            [3, { item: { name: "three" } }]
        ];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 1, Name: one");
        chai.expect(element.childNodes[5].textContent).to.equal("Element: 2, Name: two");
        chai.expect(element.childNodes[8].textContent).to.equal("Element: 3, Name: three");

        host.elements = [[2, { item: { name: "two" } }]];

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element: 2, Name: two");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuring(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<{ values: [number, number]}> };

        host.elements = [{ values: [1, 2] }];

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="const { values: [value1, value2] } of host.elements"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
        ];

        await render();

        chai.expect(element.childElementCount).to.equal(2);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");
        chai.expect(element.childNodes[5].textContent).to.equal("Element[0]: 2, Element[1]: 4");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
            { values: [3, 6] },
        ];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");
        chai.expect(element.childNodes[5].textContent).to.equal("Element[0]: 2, Element[1]: 4");
        chai.expect(element.childNodes[8].textContent).to.equal("Element[0]: 3, Element[1]: 6");

        host.elements = [{ values: [2, 4] }];

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 2, Element[1]: 4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuringDeepNested(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<{ values: [number, [[number]]]}> };

        host.elements = [{ values: [1, [[2]]] }];

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="const { values: [value1, [[value2]]] } of host.elements"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>`;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] }
        ];

        await render();

        chai.expect(element.childElementCount).to.equal(2);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");
        chai.expect(element.childNodes[5].textContent).to.equal("Element[0]: 2, Element[1]: 4");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] },
            { values: [3, [[6]]] },
        ];

        await render();

        chai.expect(element.childElementCount).to.equal(3);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 1, Element[1]: 2");
        chai.expect(element.childNodes[5].textContent).to.equal("Element[0]: 2, Element[1]: 4");
        chai.expect(element.childNodes[8].textContent).to.equal("Element[0]: 3, Element[1]: 6");

        host.elements = [{ values: [2, [[4]]] }];

        await render();

        chai.expect(element.childElementCount).to.equal(1);
        chai.expect(element.childNodes[2].textContent).to.equal("Element[0]: 2, Element[1]: 4");
    }

    @test @shouldPass
    public async templateWithConditionalAndLoopDirectives(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { condition?: boolean, items?: Array<[string, number]> };

        host.condition = false;
        host.items     =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        const element = document.createElement("div");
        host.appendChild(element);

        element.innerHTML =
        `
            <template #if="host.condition" #for="const [key, value] of host.items">
                <span>{key}: {value}</span>
            </template>
            <template #else>
                <span>Empty</span>
            </template>
        `;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(host.querySelector("span")?.textContent).to.equal("Empty");

        host.condition = true;

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("One: 1");
        chai.expect(host.querySelector("span:nth-child(2)")?.textContent).to.equal("Two: 2");
        chai.expect(host.querySelector("span:nth-child(3)")?.textContent).to.equal("Three: 3");

        host.condition = false;

        await render();

        chai.expect(host.querySelector("span")?.textContent).to.equal("Empty");
    }

    @test @shouldPass
    public async templateWithConditionalAndInjectorDirectives(): Promise<void>
    {
        const host    = document.createElement("div") as HTMLDivElement & { [PROCESSED]?: boolean, condition?: boolean, item?: [string, number] };
        const content = document.createElement("div");

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `;

        content.innerHTML =
        `
            <template #injector:items="{ item: host.item }" #if="host.condition">
                <span>Default</span>
            </template>
        `;

        host.appendChild(content);

        host.condition = false;
        host.item      = ["One", 1];

        TemplateProcessor.process(host, content);

        await render();

        chai.expect(host.querySelector("span")).to.equal(null);

        host[PROCESSED] = true;

        host.condition = true;

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("One: 1");
    }

    @test @shouldPass
    public async templateWithLoopAndConditionalDirectives(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { condition?: boolean, items?: Array<[string, number]> };

        host.condition = false;
        host.items     =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        const element = document.createElement("div");
        host.appendChild(element);

        element.innerHTML =
        `
            <template #for="const [key, value] of host.items" #if="host.condition">
                <span>{key}: {value}</span>
            </template>
            <template #else>
                <span>Empty</span>
            </template>
        `;

        TemplateProcessor.process(host, element);

        await render();

        chai.expect(host.querySelector("span")?.textContent).to.equal("Empty");

        host.condition = true;

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("One: 1");
        chai.expect(host.querySelector("span:nth-child(2)")?.textContent).to.equal("Two: 2");
        chai.expect(host.querySelector("span:nth-child(3)")?.textContent).to.equal("Three: 3");
    }

    @test @shouldPass
    public async templateWithLoopAndInjectorDirectives(): Promise<void>
    {
        const host    = document.createElement("div") as HTMLDivElement & { [PROCESSED]?: boolean, condition?: boolean, items?: Array<[string, number]> };
        const content = document.createElement("div");

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `;

        content.innerHTML =
        `
            <template #for="const item of host.items" #injector:items="{ item }">
                <span>Default</span>
            </template>
        `;

        host.appendChild(content);

        host.condition = false;
        host.items     = [];

        TemplateProcessor.process(host, content);

        await render();

        chai.expect(host.querySelector("span")).to.equal(null);

        host[PROCESSED] = true;

        host.items =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3]
        ];

        await render();

        chai.expect(host.querySelector("span:nth-child(1)")?.textContent).to.equal("One: 1");
        chai.expect(host.querySelector("span:nth-child(2)")?.textContent).to.equal("Two: 2");
        chai.expect(host.querySelector("span:nth-child(3)")?.textContent).to.equal("Three: 3");
    }

    @test @shouldFail
    public elementWithOneWayDataBindingToReadonlyProperty(): void
    {
        const document = window.document;
        const host     = document.createElement("div") as HTMLDivElement & { value?: string };
        const element  = document.createElement("div");

        host.value = "foo";

        element.innerHTML = "<span :value='host.value'</span>";

        const span = element.firstElementChild as HTMLSpanElement & { value?: string };

        Object.defineProperty(span, "value", { value: "", writable: false });

        chai.expect(() => TemplateProcessor.process(host, element)).to.throw("Property value of HTMLSpanElement is readonly");
    }

    @test @shouldFail
    public elementWithTwoWayDataBindingToReadonlyProperty(): void
    {
        const document = window.document;
        const host     = document.createElement("div") as HTMLDivElement & { value?: string };
        const element  = document.createElement("div");

        Object.defineProperty(host, "value", { value: "", writable: false });

        element.innerHTML = "<span ::value='host.value'</span>";

        const span = element.firstElementChild as HTMLSpanElement & { value?: string };

        span.value = "foo";

        chai.expect(() => TemplateProcessor.process(host, element)).to.throw("Property value of HTMLDivElement is readonly");
    }

    @test @shouldFail
    public async templateWithInvalidLoopDirective(): Promise<void>
    {
        const host = document.createElement("div") as HTMLDivElement & { elements?: Array<[number, number]> };

        const element = document.createElement("div");

        host.appendChild(element);

        element.innerHTML = `<template #for="[index0, index1] of host.elements"><span>Element[0]: {index0}, Element[1]: {index1}</span></template>`;

        try
        {
            await TemplateProcessor.process(host, element);
        }
        catch (error)
        {
            chai.expect(error.message).to.equal("Invalid #for directive expression: [index0, index1] of host.elements");
        }
    }
}