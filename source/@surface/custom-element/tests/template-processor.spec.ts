import "./fixtures/dom";

import { Indexer }                             from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import ParallelWorker                          from "../internal/parallel-worker";
import TemplateParser                          from "../internal/template-parser";
import TemplateProcessor                       from "../internal/template-processor";

const getHost = <T = { }>() =>
{
    const host = document.createElement("div");

    host.attachShadow({ mode: "open" });

    return host as unknown as HTMLElement & { shadowRoot: ShadowRoot } & T;
};
const render = async () => await ParallelWorker.done();

// declare var chai: never;

function process(host: Element, root: Node, scope?: Indexer): void
{
    const template = document.createElement("template");

    for (const child of Array.from(root.childNodes))
    {
        template.content.appendChild(child);
    }

    const descriptor = TemplateParser.parseReference(template);

    for (const child of Array.from(template.content.childNodes))
    {
        root.appendChild(child);
    }

    TemplateProcessor.process(scope ?? { host }, host, root, descriptor);
}

@suite
export default class TemplateProcessorSpec
{
    @test @shouldPass
    public elementWithoutAttributes(): void
    {
        const host= getHost();

        process(host, host.shadowRoot);
    }

    @test @shouldPass
    public elementWithAttributes(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span value='1'>Text</span>";

        process(host, host.shadowRoot);

        if (host.shadowRoot.firstElementChild)
        {
            assert.equal(host.shadowRoot.firstElementChild.getAttribute("value"), "1");
        }
    }

    @test @shouldPass
    public elementWithAttributeInterpolation(): void
    {
        const host = getHost();

        host.lang = "pt-br";
        host.shadowRoot.innerHTML = "<input type='text' lang='{host.lang}' parent='{host.tagName}'>Text</input>";

        process(host, host.shadowRoot);

        if (host.shadowRoot.firstElementChild)
        {
            const input = host.shadowRoot.firstElementChild as HTMLSpanElement;
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
        const host = getHost();

        host.lang = "pt-br";
        host.shadowRoot.innerHTML = "<span data-text='Tag lang: {host.lang}'>Text</span>";

        process(host, host.shadowRoot);

        assert.equal(host.shadowRoot.firstElementChild!.getAttribute("data-text"), "Tag lang: pt-br");

        host.lang = "en-us";

        assert.equal(host.shadowRoot.firstElementChild!.getAttribute("data-text"), "Tag lang: en-us");
    }

    @test @shouldPass
    public elementWithAttributeInterpolationExpression(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span has-childs='Has childs: {this.childNodes.length > 0}'></span>";

        process(host, host.shadowRoot);

        assert.equal(host.shadowRoot.firstElementChild!.getAttribute("has-childs"), "Has childs: false");
    }

    @test @shouldPass
    public elementWithOneWayDataBinding(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span :foo='host.tagName'</span>";

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement & { foo?: string };

        span.foo = "";

        process(host, host.shadowRoot, { host });

        assert.equal(span.foo, "DIV");
    }

    @test @shouldPass
    public elementWithClassOneWayDataBinding(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span :class='({ closed: true })'</span>";

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement & { foo?: string };

        process(host, host.shadowRoot, { host });

        assert.isTrue(span.classList.contains("closed"));
    }

    @test @shouldPass
    public elementWithStyleOneWayDataBinding(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span :style='({ display: `none` })'</span>";

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement & { foo?: string };

        process(host, host.shadowRoot, { host });

        assert.equal(span.style.display, "none");
    }

    @test @shouldPass
    public elementWithOneWayDataBindingToWindowFallback(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span lang='{Node.name}'</span>";

        process(host, host.shadowRoot);

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement;

        assert.equal(span.lang, "Node");
    }

    @test @shouldPass
    public elementWithTwoWayDataBinding(): void
    {
        const host = getHost<{ value?: string }>();

        host.id = "host";
        host.id = "hostRoot";

        host.shadowRoot.innerHTML = "<span ::value='host.value'</span>";

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement & { value?: string };

        host.value = "";
        span.value = "";

        process(host, host.shadowRoot);

        host.value = "foo";

        assert.equal(span.value, "foo");

        span.value = "foo";

        assert.equal(host.value, "foo");
    }

    @test @shouldPass
    public elementWithAttributesWithEventBind(): void
    {
        const host = getHost();

        let clicked = false;

        host.click = () => clicked = true;

        host.shadowRoot.innerHTML = "<span #on:click='host.click'>Text</span>";

        process(host, host.shadowRoot);

        host.shadowRoot.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
    }

    @test @shouldPass
    public elementWithAttributesWithExpressionEventBind(): void
    {
        const host = getHost<{ method?: Function }>();

        let clicked = false;

        host.method = (value: boolean) => clicked = value;

        host.shadowRoot.innerHTML = "<span #on:click='host.method(true)'>Text</span>";

        process(host, host.shadowRoot);

        host.shadowRoot.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
    }

    @test @shouldPass
    public elementWithTextNodeInterpolation(): void
    {
        const host = getHost();

        host.id = "01";
        host.shadowRoot.innerHTML = "<span>Host id: {host.id}</span>";

        process(host, host.shadowRoot);

        assert.equal(host.shadowRoot.firstElementChild!.innerHTML, "Host id: 01");

        host.id = "02";

        assert.equal(host.shadowRoot.firstElementChild!.innerHTML, "Host id: 02");
    }

    @test @shouldPass
    public elementWithTextNodeInterpolationExpression(): void
    {
        const host = getHost();

        host.id = "01";
        host.shadowRoot.innerHTML = "<span>{host.id == '01'}</span>";

        process(host, host.shadowRoot);

        assert.equal(host.shadowRoot.firstElementChild!.innerHTML, "true");

        host.id = "02";

        assert.equal(host.shadowRoot.firstElementChild!.innerHTML, "false");
    }

    @test @shouldPass
    public async templateWithoutDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        root.innerHTML = "<template>World</template>";
        host.innerHTML = "<span>Hello </span><span>!!!</span>";

        root.shadowRoot.appendChild(host);

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        assert.equal(host.innerHTML, "<span>Hello </span><span>!!!</span>");
    }

    @test @shouldPass
    public async templateWithInjectDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        root.id = "root";
        host.id = "host";

        host.shadowRoot.innerHTML = "<span>Hello </span><template #injector:items></template><span>!!!</span>";
        host.innerHTML            = "<template #inject:items>World</template>";

        root.shadowRoot.appendChild(host);

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndInjectorDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ item?: { value: string } }>();

        host.item = { value: "People" };

        host.innerHTML = "<template #inject:item='{ item }'>{item.value}</template>";

        host.shadowRoot.innerHTML = "<span>Hello </span><template #injector:item='({ item: host.item })'></template><span>!!!</span>";

        root.shadowRoot.appendChild(host);

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.textContent, "Hello People!!!");

        host.item = { value: "World" };

        await render();

        assert.equal(host.shadowRoot.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectorDirectiveWithDefault(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        root.shadowRoot.appendChild(host);

        host.shadowRoot.innerHTML = "<span>Hello </span><template #injector:items>Default</template><span>!!!</span>";

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await new Promise(x => window.setTimeout(x));
        await render();

        assert.equal(host.shadowRoot.textContent, "Hello Default!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndConditionalDirectives(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ items?: Array<[string, number, boolean]> }>();

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value, visible] }">
                <template #if="visible">
                    <span>{key}: {value}</span>
                </template>
            </template>
        `;

        host.shadowRoot.innerHTML = `<template #for="const item of host.items" #injector:items="({ item })"><span>Default</span></template>`;

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        host.items = [];

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.querySelector("span"), null);

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, true],
            ["Three", 3, true]
        ];

        await render();

        assert.equal(host.shadowRoot.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(3)")?.textContent, "Three: 3");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, false],
            ["Three", 3, true]
        ];

        await render();

        assert.equal(host.shadowRoot.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(2)")?.textContent, "Three: 3");
    }

    @test @shouldPass
    public async templateWithInjectAndInjectorDirectives(): Promise<void>
    {
        const root      = getHost();
        const host      = getHost();
        const childHost = getHost<{ item?: [string, number] }>();

        childHost.shadowRoot.innerHTML =
        `
            <template #injector:items2="({ item: host.item })">
                <span>Injector 2</span>
            </template>
        `;

        childHost.innerHTML =
        `
            <template #inject:items2="{ item }">
                <template #injector:items1="({ item })">
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


        host.shadowRoot.appendChild(childHost);
        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        childHost.item = ["Value", 1];

        process(childHost, childHost.shadowRoot);
        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await render();

        assert.equal(childHost.shadowRoot.querySelector("span")?.textContent, "Value: 1");
    }

    @test @shouldPass
    public async templateWithConditionalDirective(): Promise<void>
    {
        const host = getHost<{ order?: number }>();

        host.order = 1;

        host.shadowRoot.innerHTML = `<template #if="host.order == 1"><span>First</span></template><template>Ignore me</template>>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.firstElementChild?.textContent, "First");

        host.order = 2;

        await render();

        assert.equal(host.shadowRoot.firstElementChild?.textContent, "");

        host.shadowRoot.innerHTML = "";

        host.order = 0;

        assert.equal(host.shadowRoot.childNodes.length, 0);
    }

    @test @shouldPass
    public async templateWithMultiplesConditionalDirective(): Promise<void>
    {
        const host = getHost<{ order?: number }>();

        host.order = 1;

        host.shadowRoot.innerHTML = `<template #if="host.order == 1">First</template><template #else-if="host.order == 2">Second</template><template #else>Last</template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childNodes[1].textContent, "First");

        host.order = 2;

        await render();

        assert.equal(host.shadowRoot.childNodes[1].textContent, "Second");

        host.order = 3;

        await render();

        assert.equal(host.shadowRoot.childNodes[1].textContent, "Last");
    }

    @test @shouldPass
    public async templateWithForInLoopDirective(): Promise<void>
    {
        const host = getHost<{ elements?: Array<number> }>();

        host.elements = [1];

        host.shadowRoot.innerHTML = `<template #for="const index in host.elements"><span>Element: {index}</span></template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 0");

        host.elements = [1, 2];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 2);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 0");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 1");

        host.elements = [1, 2, 3];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 0");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 1");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element: 2");

        host.elements = [2];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 0");
    }

    @test @shouldPass
    public async templateWithForOfLoopDirective(): Promise<void>
    {
        const host = getHost<{ elements?: Array<number> }>();

        host.elements = [1];

        host.shadowRoot.innerHTML = `<template #for="const index of host.elements"><span>Element: {index}</span></template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 1");

        host.elements = [1, 2];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 2);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 1");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 2");

        host.elements = [1, 2, 3];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 1");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 2");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element: 3");

        host.elements = [2];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 2");

        host.elements = [1, 2, 3];

        await render();

        host.elements = [3, 2, 1];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 3");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 2");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element: 1");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuring(): Promise<void>
    {
        const host = getHost<{ elements?: Array<[number, number]> }>();

        host.elements = [[1, 2]];

        host.shadowRoot.innerHTML = `<template #for="const [index0, index1] of host.elements"><span>Element[0]: {index0}, Element[1]: {index1}</span></template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");

        host.elements = [[1, 2], [2, 4]];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 2);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");

        host.elements = [[1, 2], [2, 4], [3, 6]];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element[0]: 3, Element[1]: 6");

        host.elements = [[2, 4]];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 2, Element[1]: 4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuringDeepNested(): Promise<void>
    {
        const host = getHost<{ elements?: Array<[number, { item: { name: string } }]> }>();

        host.elements = [[1, { item: { name: "one" } }]];

        host.shadowRoot.innerHTML = `<template #for="const [index, { item: { name } }] of host.elements"><span>Element: {index}, Name: {name}</span></template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 1, Name: one");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }]
        ];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 2);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 1, Name: one");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 2, Name: two");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }],
            [3, { item: { name: "three" } }]
        ];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 1, Name: one");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element: 2, Name: two");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element: 3, Name: three");

        host.elements = [[2, { item: { name: "two" } }]];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element: 2, Name: two");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuring(): Promise<void>
    {
        const host = getHost<{ elements?: Array<{ values: [number, number]}> }>();

        host.elements = [{ values: [1, 2] }];

        host.shadowRoot.innerHTML = `<template #for="const { values: [value1, value2] } of host.elements"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
        ];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 2);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
            { values: [3, 6] },
        ];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element[0]: 3, Element[1]: 6");

        host.elements = [{ values: [2, 4] }];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 2, Element[1]: 4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuringDeepNested(): Promise<void>
    {
        const host = getHost<{ elements?: Array<{ values: [number, [[number]]]}> }>();

        host.elements = [{ values: [1, [[2]]] }];

        host.shadowRoot.innerHTML = `<template #for="const { values: [value1, [[value2]]] } of host.elements"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>`;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] }
        ];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 2);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] },
            { values: [3, [[6]]] },
        ];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 3);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 1, Element[1]: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "Element[0]: 2, Element[1]: 4");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "Element[0]: 3, Element[1]: 6");

        host.elements = [{ values: [2, [[4]]] }];

        await render();

        assert.equal(host.shadowRoot.childElementCount, 1);
        assert.equal(host.shadowRoot.childNodes[2].textContent, "Element[0]: 2, Element[1]: 4");
    }

    @test @shouldPass
    public async templateWithConditionalAndLoopDirectives(): Promise<void>
    {
        const host = getHost<{ condition?: boolean, items?: Array<[string, number]> }>();

        host.condition = false;
        host.items     =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        host.shadowRoot.innerHTML =
        `
            <template #if="host.condition" #for="const [key, value] of host.items">
                <span>{key}: {value}</span>
            </template>
            <template #else>
                <span>Empty</span>
            </template>
        `;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.querySelector("span")?.textContent, "Empty");

        host.condition = true;

        await render();

        assert.equal(host.shadowRoot.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(3)")?.textContent, "Three: 3");

        host.condition = false;

        await render();

        assert.equal(host.shadowRoot.querySelector("span")?.textContent, "Empty");
    }

    @test @shouldPass
    public async templateWithConditionalAndInjectorDirectives(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ condition?: boolean, item?: [string, number] }>();

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `;

        host.shadowRoot.innerHTML =
        `
            <template #if="host.condition" #injector:items="({ item: host.item })">
                <span>Default</span>
            </template>
        `;

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        host.condition = false;
        host.item      = ["One", 1];

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.querySelector("span"), null);

        host.condition = true;

        await render();

        assert.equal(host.shadowRoot.querySelector("span:nth-child(1)")?.textContent, "One: 1");
    }

    @test @shouldPass
    public async templateWithLoopAndConditionalDirectives(): Promise<void>
    {
        const host = getHost<{ condition?: boolean, items?: Array<[string, number]> }>();

        host.condition = false;
        host.items     =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        host.shadowRoot.innerHTML =
        `
            <template #if="host.condition" #for="const [key, value] of host.items">
                <span>{key}: {value}</span>
            </template>
            <template #else>
                <span>Empty</span>
            </template>
        `;

        process(host, host.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.querySelector("span")?.textContent, "Empty");

        host.condition = true;

        await render();

        assert.equal(host.shadowRoot.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(3)")?.textContent, "Three: 3");
    }

    @test @shouldPass
    public async templateWithLoopAndInjectorDirectives(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ condition?: boolean, items?: Array<[string, number]> }>();

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `;

        host.shadowRoot.innerHTML =
        `
            <template #for="const item of host.items" #injector:items="({ item })">
                <span>Default</span>
            </template>
        `;

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        host.condition = false;
        host.items     = [];

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await render();

        assert.equal(host.shadowRoot.querySelector("span"), null);

        host.items =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3]
        ];

        await render();

        assert.equal(host.shadowRoot.querySelector("span:nth-child(1)")?.textContent, "One: 1");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(2)")?.textContent, "Two: 2");
        assert.equal(host.shadowRoot.querySelector("span:nth-child(3)")?.textContent, "Three: 3");
    }

    @test @shouldFail
    public elementWithOneWayDataBindingToReadonlyProperty(): void
    {
        const host = getHost<{ value?: string }>();

        host.value = "foo";

        host.shadowRoot.innerHTML = "<span :value='host.value'</span>";

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement & { value?: string };

        Object.defineProperty(span, "value", { value: "", writable: false });

        assert.throw(() => process(host, host.shadowRoot), "Property value of HTMLSpanElement is readonly");
    }

    @test @shouldFail
    public elementWithTwoWayDataBindingToReadonlyProperty(): void
    {
        const host = getHost<{ value?: string }>();

        Object.defineProperty(host, "value", { value: "", writable: false });

        host.shadowRoot.innerHTML = "<span ::value='host.value'</span>";

        const span = host.shadowRoot.firstElementChild as HTMLSpanElement & { value?: string };

        span.value = "foo";

        assert.throw(() => process(host, host.shadowRoot), "Property value of HTMLDivElement is readonly");
    }
}