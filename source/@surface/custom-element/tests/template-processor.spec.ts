import "./fixtures/dom";

import { Indexer }                 from "@surface/core";
import { shouldPass, suite, test } from "@surface/test-suite";
import { assert }                  from "chai";
import TemplateMetadata            from "../internal/metadata/template-metadata";
import TemplateParser              from "../internal/template-parser";
import TemplateProcessor           from "../internal/template-processor";

const render = async (interval?: number) => await new Promise(resolve => setTimeout(resolve, interval ?? 0));

// declare var chai: never;

function process(host: Element, element: Element, scope?: Indexer): void
{
    const template = document.createElement("template");

    for (const child of Array.from(element.childNodes))
    {
        template.content.appendChild(child);
    }

    const descriptor = TemplateParser.parseReference(template);

    for (const child of Array.from(template.content.childNodes))
    {
        element.appendChild(child);
    }

    TemplateProcessor.process(scope ?? { host }, host, element, descriptor);
}

@suite
export default class TemplateProcessorSpec
{
    @test @shouldPass
    public elementWithoutAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("span");

        process(host, element);
    }

    @test @shouldPass
    public elementWithAttributes(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span value='1'>Text</span>";

        process(host, element);

        if (element.firstElementChild)
        {
            assert.equal(element.firstElementChild.getAttribute("value"), "1");
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

        process(host, element);

        if (element.firstElementChild)
        {
            const input = element.firstElementChild as HTMLSpanElement;
            assert.equal(input.lang, "pt-br");
            assert.equal(input.getAttribute("lang"), "pt-br");
            assert.equal(input.getAttribute("parent"), "DIV");

            host.lang = "en-us";
            assert.equal(input.lang, "en-us");
            assert.equal(input.getAttribute("lang"), "en-us");
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

        process(host, element);

        assert.equal(element.firstElementChild!.getAttribute("data-text"), "Tag lang: pt-br");

        host.lang = "en-us";

        assert.equal(element.firstElementChild!.getAttribute("data-text"), "Tag lang: en-us");
    }

    @test @shouldPass
    public elementWithAttributeInterpolationExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span has-childs='Has childs: {this.childNodes.length > 0}'></span>";

        process(host, element);

        assert.equal(element.firstElementChild!.getAttribute("has-childs"), "Has childs: false");
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

        process(host, element, { host });

        assert.equal(span.foo, "DIV");
    }

    @test @shouldPass
    public elementWithOneWayDataBindingToWindowFallback(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        element.innerHTML = "<span lang='{Node.name}'</span>";

        process(host, element);

        const span = element.firstElementChild as HTMLSpanElement;

        assert.equal(span.lang, "Node");
    }

    @test @shouldPass
    public elementWithTwoWayDataBinding(): void
    {
        const document = window.document;
        const host     = document.createElement("div") as HTMLDivElement & { value?: string };
        const hostRoot = document.createElement("div");

        host.id = "host";
        host.id = "hostRoot";

        hostRoot.innerHTML = "<span ::value='host.value'</span>";

        const span = hostRoot.firstElementChild as HTMLSpanElement & { value?: string };

        host.value = "";
        span.value = "";

        process(host, hostRoot);

        host.value = "foo";

        assert.equal(span.value, "foo");

        span.value = "foo";

        assert.equal(host.value, "foo");
    }

    // // @test @shouldPass
    // // public async customElementWithTwoWayDataBinding(): Promise<void>
    // // {
    // //     const document = window.document;
    // //     const host     = document.createElement("div") as HTMLDivElement & { value?: string };
    // //     const element  = new MockParent();

    // //     const postProcessing = (TemplateProcessor as Indexer).postProcessing as Map<Node, Array<Action>>;

    // //     const action = Array.from(postProcessing.values())[0];

    // //     postProcessing.clear();

    // //     postProcessing.set()

    // //     process(host, element);

    // //     await render();

    // //     assert.equal(host.value, 0);
    // // }

    @test @shouldPass
    public elementWithAttributesWithEventBind(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        let clicked = false;

        host.click = () => clicked = true;

        element.innerHTML = "<span on:click='host.click'>Text</span>";

        process(host, element);

        element.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
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

        process(host, element);

        element.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
    }

    @test @shouldPass
    public elementWithTextNodeInterpolation(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.id = "01";
        element.innerHTML = "<span>Host id: {host.id}</span>";

        process(host, element);

        assert.equal(element.firstElementChild!.innerHTML, "Host id: 01");

        host.id = "02";

        assert.equal(element.firstElementChild!.innerHTML, "Host id: 02");
    }

    @test @shouldPass
    public elementWithTextNodeInterpolationExpression(): void
    {
        const document = window.document;
        const host     = document.createElement("div");
        const element  = document.createElement("div");

        host.id = "01";
        element.innerHTML = "<span>{host.id == '01'}</span>";

        process(host, element);

        assert.equal(element.firstElementChild!.innerHTML, "true");

        host.id = "02";

        assert.equal(element.firstElementChild!.innerHTML, "false");
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

        process(host, element);
        process(root, host);

        await render();

        assert.equal(host.innerHTML, "<template>World</template><div><span>Hello </span><span>!!!</span></div>");
    }

    @test @shouldPass
    public async templateWithInjectDirective(): Promise<void>
    {
        const root     = document.createElement("div");
        const host     = document.createElement("div");
        const hostRoot = document.createElement("div");

        root.id     = "root";
        host.id     = "host";
        hostRoot.id = "hostRoot";

        hostRoot.innerHTML = "<span>Hello </span><template #injector:items></template><span>!!!</span>";

        host.innerHTML = "<template #inject:items>World</template>";

        host.appendChild(hostRoot);
        root.appendChild(host);

        process(host, hostRoot);
        process(root, host);

        assert.equal(root.querySelector("div")?.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndScopeDirective(): Promise<void>
    {
        const root     = document.createElement("div");
        const host     = document.createElement("div") as HTMLDivElement & { item?: { value: string } };
        const hostRoot = document.createElement("div");

        host.item = { value: "People" };

        host.innerHTML = "<template #inject:item='{ item }'>{item.value}</template>";

        root.appendChild(host);
        host.appendChild(hostRoot);

        hostRoot.innerHTML = "<span>Hello </span><template #injector:item='{ item: host.item }'></template><span>!!!</span>";

        process(host, hostRoot);
        process(root, host);

        assert.equal(root.querySelector("div")?.textContent, "Hello People!!!");

        host.item = { value: "World" };

        await render();

        assert.equal(root.querySelector("div")?.textContent, "Hello World!!!");

        hostRoot.innerHTML = "";

        host.item = { value: "" };

        assert.equal(hostRoot.childNodes.length, 0);
    }

    @test @shouldPass
    public async templateWithInjectorDirectiveWithDefault(): Promise<void>
    {
        const root     = document.createElement("div");
        const host     = document.createElement("div");
        const hostRoot = document.createElement("div");

        root.appendChild(host);
        host.appendChild(hostRoot);

        hostRoot.innerHTML = "<span>Hello </span><template #injector:items>Default</template><span>!!!</span>";

        process(host, hostRoot);
        process(root, host);

        await render();

        assert.equal(root.querySelector("div")?.textContent, "Hello Default!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndConditionalDirectives(): Promise<void>
    {
        const root     = document.createElement("div");
        const host     = document.createElement("div") as HTMLDivElement & { condition?: boolean, items?: Array<[string, number, boolean]> };
        const hostRoot = document.createElement("div");

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value, visible] }">
                <template #if="visible">
                    <span>{key}: {value}</span>
                </template>
            </template>
        `;

        hostRoot.innerHTML =
        `
            <template #for="const item of host.items" #injector:items="{ item }">
                <span>Default</span>
            </template>
        `;

        root.appendChild(host);
        host.appendChild(hostRoot);

        host.condition = false;
        host.items     = [];

        process(host, hostRoot);
        process(root, host);

        TemplateMetadata.from(host).processed = true;

        await render();

        assert.equal(host.querySelector("span"), null);

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, true],
            ["Three", 3, true]
        ];
        host.condition = true;

        await render();

        assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
        assert.equal(host.querySelector("span:nth-child(3)")?.textContent, "Three: 3");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, false],
            ["Three", 3, true]
        ];

        await render();

        assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.querySelector("span:nth-child(2)")?.textContent, "Three: 3");
    }

    @test @shouldPass
    public async templateWithInjectAndInjectorDirectives(): Promise<void>
    {
        const root          = document.createElement("div");
        const host          = document.createElement("div");
        const childHost     = document.createElement("div") as HTMLDivElement & { item?: [string, number] };
        const childHostRoot = document.createElement("div");

        /*

         */

        childHostRoot.innerHTML =
        `
            <template #injector:items2="{ item: host.item }">
                <span>Injector 2</span>
            </template>
        `;

        childHost.innerHTML =
        `
            <template #inject:items2="{ item }">
                <template #injector:items1="{ item }">
                    <span>Injector 1</span>
                </template>
            </template>
        `;

        host.innerHTML =
        `
            <template #inject:items1="{ item }">
                <span>{item[0]}: {item[1]}</span>
            </template>
        `;

        childHost.appendChild(childHostRoot);
        host.appendChild(childHost);
        root.appendChild(host);

        childHost.item = ["Value", 1];

        TemplateMetadata.from(root).processed = true;

        process(childHost, childHostRoot);
        process(host, childHost);
        process(root, host);

        await render();

        assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "Value: 1");
    }

    // @test @shouldPass
    // public async templateWithConditionalDirective(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { order?: number };

    //     host.order = 1;

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #if="host.order == 1"><span>First</span></template><template>Ignore me</template>>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.firstElementChild?.textContent, "First");

    //     host.order = 2;

    //     await render();

    //     assert.equal(element.firstElementChild?.textContent, "");

    //     element.innerHTML = "";

    //     host.order = 0;

    //     assert.equal(element.childNodes.length, 0);
    // }

    // @test @shouldPass
    // public async templateWithMultiplesConditionalDirective(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { order?: number };

    //     host.order = 1;

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #if="host.order == 1">First</template><template #else-if="host.order == 2">Second</template><template #else>Last</template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childNodes[1].textContent, "First");

    //     host.order = 2;

    //     await render();

    //     assert.equal(element.childNodes[1].textContent, "Second");

    //     host.order = 3;

    //     await render();

    //     assert.equal(element.childNodes[1].textContent, "Last");

    //     element.innerHTML = "";

    //     host.order = 0;

    //     assert.equal(element.childNodes.length, 0);
    // }

    // @test @shouldPass
    // public async templateWithForInLoopDirective(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { elements?: Array<number> };

    //     host.elements = [1];

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #for="const index in host.elements"><span>Element: {index}</span></template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element: 0");

    //     host.elements = [1, 2];

    //     await render();

    //     assert.equal(element.childElementCount, 2);
    //     assert.equal(element.childNodes[2].textContent, "Element: 0");
    //     assert.equal(element.childNodes[5].textContent, "Element: 1");

    //     host.elements = [1, 2, 3];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element: 0");
    //     assert.equal(element.childNodes[5].textContent, "Element: 1");
    //     assert.equal(element.childNodes[8].textContent, "Element: 2");

    //     host.elements = [2];

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element: 0");
    // }

    // @test @shouldPass
    // public async templateWithForOfLoopDirective(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { elements?: Array<number> };

    //     host.elements = [1];

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #for="const index of host.elements"><span>Element: {index}</span></template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element: 1");

    //     host.elements = [1, 2];

    //     await render();

    //     assert.equal(element.childElementCount, 2);
    //     assert.equal(element.childNodes[2].textContent, "Element: 1");
    //     assert.equal(element.childNodes[5].textContent, "Element: 2");

    //     host.elements = [1, 2, 3];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element: 1");
    //     assert.equal(element.childNodes[5].textContent, "Element: 2");
    //     assert.equal(element.childNodes[8].textContent, "Element: 3");

    //     host.elements = [2];

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element: 2");

    //     host.elements = [1, 2, 3];

    //     await render();

    //     host.elements = [3, 2, 1];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element: 3");
    //     assert.equal(element.childNodes[5].textContent, "Element: 2");
    //     assert.equal(element.childNodes[8].textContent, "Element: 1");

    //     element.innerHTML = "";

    //     host.elements = [];

    //     assert.equal(element.childNodes.length, 0);
    // }

    // @test @shouldPass
    // public async templateWithLoopDirectiveWithArrayDestructuring(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { elements?: Array<[number, number]> };

    //     host.elements = [[1, 2]];

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #for="const [index0, index1] of host.elements"><span>Element[0]: {index0}, Element[1]: {index1}</span></template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");

    //     host.elements = [[1, 2], [2, 4]];

    //     await render();

    //     assert.equal(element.childElementCount, 2);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
    //     assert.equal(element.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");

    //     host.elements = [[1, 2], [2, 4], [3, 6]];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
    //     assert.equal(element.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");
    //     assert.equal(element.childNodes[8].textContent, "Element[0]: 3, Element[1]: 6");

    //     host.elements = [[2, 4]];

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 2, Element[1]: 4");
    // }

    // @test @shouldPass
    // public async templateWithLoopDirectiveWithArrayDestructuringDeepNested(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { elements?: Array<[number, { item: { name: string } }]> };

    //     host.elements = [[1, { item: { name: "one" } }]];

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #for="const [index, { item: { name } }] of host.elements"><span>Element: {index}, Name: {name}</span></template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element: 1, Name: one");

    //     host.elements =
    //     [
    //         [1, { item: { name: "one" } }],
    //         [2, { item: { name: "two" } }]
    //     ];

    //     await render();

    //     assert.equal(element.childElementCount, 2);
    //     assert.equal(element.childNodes[2].textContent, "Element: 1, Name: one");
    //     assert.equal(element.childNodes[5].textContent, "Element: 2, Name: two");

    //     host.elements =
    //     [
    //         [1, { item: { name: "one" } }],
    //         [2, { item: { name: "two" } }],
    //         [3, { item: { name: "three" } }]
    //     ];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element: 1, Name: one");
    //     assert.equal(element.childNodes[5].textContent, "Element: 2, Name: two");
    //     assert.equal(element.childNodes[8].textContent, "Element: 3, Name: three");

    //     host.elements = [[2, { item: { name: "two" } }]];

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element: 2, Name: two");
    // }

    // @test @shouldPass
    // public async templateWithLoopDirectiveWithObjectDestructuring(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { elements?: Array<{ values: [number, number]}> };

    //     host.elements = [{ values: [1, 2] }];

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #for="const { values: [value1, value2] } of host.elements"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");

    //     host.elements =
    //     [
    //         { values: [1, 2] },
    //         { values: [2, 4] },
    //     ];

    //     await render();

    //     assert.equal(element.childElementCount, 2);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
    //     assert.equal(element.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");

    //     host.elements =
    //     [
    //         { values: [1, 2] },
    //         { values: [2, 4] },
    //         { values: [3, 6] },
    //     ];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
    //     assert.equal(element.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");
    //     assert.equal(element.childNodes[8].textContent, "Element[0]: 3, Element[1]: 6");

    //     host.elements = [{ values: [2, 4] }];

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 2, Element[1]: 4");
    // }

    // @test @shouldPass
    // public async templateWithLoopDirectiveWithObjectDestructuringDeepNested(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { elements?: Array<{ values: [number, [[number]]]}> };

    //     host.elements = [{ values: [1, [[2]]] }];

    //     const element = document.createElement("div");

    //     host.appendChild(element);

    //     element.innerHTML = `<template #for="const { values: [value1, [[value2]]] } of host.elements"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>`;

    //     process(host, element);

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");

    //     host.elements =
    //     [
    //         { values: [1, [[2]]] },
    //         { values: [2, [[4]]] }
    //     ];

    //     await render();

    //     assert.equal(element.childElementCount, 2);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
    //     assert.equal(element.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");

    //     host.elements =
    //     [
    //         { values: [1, [[2]]] },
    //         { values: [2, [[4]]] },
    //         { values: [3, [[6]]] },
    //     ];

    //     await render();

    //     assert.equal(element.childElementCount, 3);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
    //     assert.equal(element.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");
    //     assert.equal(element.childNodes[8].textContent, "Element[0]: 3, Element[1]: 6");

    //     host.elements = [{ values: [2, [[4]]] }];

    //     await render();

    //     assert.equal(element.childElementCount, 1);
    //     assert.equal(element.childNodes[2].textContent, "Element[0]: 2, Element[1]: 4");
    // }

    // @test @shouldPass
    // public async templateWithConditionalAndLoopDirectives(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { condition?: boolean, items?: Array<[string, number]> };

    //     host.condition = false;
    //     host.items     =
    //     [
    //         ["One",   1],
    //         ["Two",   2],
    //         ["Three", 3],
    //     ];

    //     const element = document.createElement("div");
    //     host.appendChild(element);

    //     element.innerHTML =
    //     `
    //         <template #if="host.condition" #for="const [key, value] of host.items">
    //             <span>{key}: {value}</span>
    //         </template>
    //         <template #else>
    //             <span>Empty</span>
    //         </template>
    //     `;

    //     process(host, element);

    //     await render();

    //     assert.equal(host.querySelector("span")?.textContent, "Empty");

    //     host.condition = true;

    //     await render();

    //     assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "One: 1");
    //     assert.equal(host.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
    //     assert.equal(host.querySelector("span:nth-child(3)")?.textContent, "Three: 3");

    //     host.condition = false;

    //     await render();

    //     assert.equal(host.querySelector("span")?.textContent, "Empty");
    // }

    // @test @shouldPass
    // public async templateWithConditionalAndInjectorDirectives(): Promise<void>
    // {
    //     const host    = document.createElement("div") as HTMLDivElement & { [PROCESSED]?: boolean, condition?: boolean, item?: [string, number] };
    //     const content = document.createElement("div");

    //     host.innerHTML    =
    //     `
    //         <template #inject:items="{ item: [key, value] }">
    //             <span>{key}: {value}</span>
    //         </template>
    //     `;

    //     content.innerHTML =
    //     `
    //         <template #injector:items="{ item: host.item }" #if="host.condition">
    //             <span>Default</span>
    //         </template>
    //     `;

    //     host.appendChild(content);

    //     host.condition = false;
    //     host.item      = ["One", 1];

    //     process(host, content);

    //     await render();

    //     assert.equal(host.querySelector("span"), null);

    //     host[PROCESSED] = true;

    //     host.condition = true;

    //     await render();

    //     assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "One: 1");
    // }

    // @test @shouldPass
    // public async templateWithLoopAndConditionalDirectives(): Promise<void>
    // {
    //     const host = document.createElement("div") as HTMLDivElement & { condition?: boolean, items?: Array<[string, number]> };

    //     host.condition = false;
    //     host.items     =
    //     [
    //         ["One",   1],
    //         ["Two",   2],
    //         ["Three", 3],
    //     ];

    //     const element = document.createElement("div");
    //     host.appendChild(element);

    //     element.innerHTML =
    //     `
    //         <template #for="const [key, value] of host.items" #if="host.condition">
    //             <span>{key}: {value}</span>
    //         </template>
    //         <template #else>
    //             <span>Empty</span>
    //         </template>
    //     `;

    //     process(host, element);

    //     await render();

    //     assert.equal(host.querySelector("span")?.textContent, "Empty");

    //     host.condition = true;

    //     await render();

    //     assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "One: 1");
    //     assert.equal(host.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
    //     assert.equal(host.querySelector("span:nth-child(3)")?.textContent, "Three: 3");
    // }

    // @test @shouldPass
    // public async templateWithLoopAndInjectorDirectives(): Promise<void>
    // {
    //     const host    = document.createElement("div") as HTMLDivElement & { [PROCESSED]?: boolean, condition?: boolean, items?: Array<[string, number]> };
    //     const content = document.createElement("div");

    //     host.innerHTML    =
    //     `
    //         <template #inject:items="{ item: [key, value] }">
    //             <span>{key}: {value}</span>
    //         </template>
    //     `;

    //     content.innerHTML =
    //     `
    //         <template #for="const item of host.items" #injector:items="{ item }">
    //             <span>Default</span>
    //         </template>
    //     `;

    //     host.appendChild(content);

    //     host.condition = false;
    //     host.items     = [];

    //     process(host, content);

    //     await render();

    //     assert.equal(host.querySelector("span"), null);

    //     host[PROCESSED] = true;

    //     host.items =
    //     [
    //         ["One",   1],
    //         ["Two",   2],
    //         ["Three", 3]
    //     ];

    //     await render();

    //     assert.equal(host.querySelector("span:nth-child(1)")?.textContent, "One: 1");
    //     assert.equal(host.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
    //     assert.equal(host.querySelector("span:nth-child(3)")?.textContent, "Three: 3");
    // }

    // @test @shouldFail
    // public elementWithOneWayDataBindingToReadonlyProperty(): void
    // {
    //     const document = window.document;
    //     const host     = document.createElement("div") as HTMLDivElement & { value?: string };
    //     const element  = document.createElement("div");

    //     host.value = "foo";

    //     element.innerHTML = "<span :value='host.value'</span>";

    //     const span = element.firstElementChild as HTMLSpanElement & { value?: string };

    //     Object.defineProperty(span, "value", { value: "", writable: false });

    //     assert.equal(() => process(host, element)).to.throw("Property value of HTMLSpanElement is readonly");
    // }

    // @test @shouldFail
    // public elementWithTwoWayDataBindingToReadonlyProperty(): void
    // {
    //     const document = window.document;
    //     const host     = document.createElement("div") as HTMLDivElement & { value?: string };
    //     const element  = document.createElement("div");

    //     Object.defineProperty(host, "value", { value: "", writable: false });

    //     element.innerHTML = "<span ::value='host.value'</span>";

    //     const span = element.firstElementChild as HTMLSpanElement & { value?: string };

    //     span.value = "foo";

    //     assert.equal(() => process(host, element)).to.throw("Property value of HTMLDivElement is readonly");
    // }
}