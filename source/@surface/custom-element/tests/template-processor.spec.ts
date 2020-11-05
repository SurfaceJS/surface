/* eslint-disable max-lines */
// eslint-disable-next-line import/no-unassigned-import
import "./fixtures/dom";

import { Delegate, Indexer, uuidv4 }           from "@surface/core";
import { shouldFail, shouldPass, suite, test } from "@surface/test-suite";
import { assert }                              from "chai";
import CustomElement                           from "../internal/custom-element";
import { element }                             from "../internal/decorators";
import directiveRegistry                       from "../internal/directive-registry";
import CustomStackError                        from "../internal/errors/custom-stack-error";
import TemplateEvaluationError                 from "../internal/errors/template-evaluation-error";
import { whenDone }                            from "../internal/processors";
import TemplateParser                          from "../internal/template-parser";
import TemplateProcessor                       from "../internal/template-processor";
import CustomDirectiveHandler                  from "./fixtures/custom-directive";
import customDirectiveFactory                  from "./fixtures/custom-directive-factory";

type RawError = { message: string } | Pick<CustomStackError, "message" | "stack">;

class XComponent extends HTMLElement { }

window.customElements.define("x-component", XComponent);

directiveRegistry.set("custom", CustomDirectiveHandler);
directiveRegistry.set("custom-factory", customDirectiveFactory);

function tryAction(action: Delegate): RawError
{
    try
    {
        action();
    }
    catch (error)
    {
        return toRaw(error);
    }

    return toRaw(new CustomStackError("", ""));
}

async function tryActionAsync(action: Delegate): Promise<RawError>
{
    try
    {
        action();

        await whenDone();
    }
    catch (error)
    {
        return toRaw(error);
    }

    return toRaw(new CustomStackError("", ""));
}

function toRaw(error: Error): RawError
{
    if (error instanceof CustomStackError || error instanceof TemplateEvaluationError)
    {
        return {
            message: error.message,
            stack:   error.stack,
        };
    }

    return { message: error.message };
}

const getHost = <T = { }>(): XComponent & { shadowRoot: ShadowRoot } & T =>
{
    const host = document.createElement("x-component") as XComponent;

    host.attachShadow({ mode: "open" });

    return host as unknown as XComponent & { shadowRoot: ShadowRoot } & T;
};

function process(host: Element, root: Node, scope?: Indexer): void
{
    const template = document.createElement("template");

    for (const child of Array.from(root.childNodes))
    {
        template.content.appendChild(child);
    }

    const descriptor = TemplateParser.parseReference("x-component", template);

    for (const child of Array.from(template.content.childNodes))
    {
        root.appendChild(child);
    }

    TemplateProcessor.process({ descriptor, host, root, scope: scope ?? { host } });
}

@suite
export default class TemplateProcessorSpec
{
    @test @shouldPass
    public elementWithoutAttributes(): void
    {
        const host = getHost();

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
            assert.equal(input.getAttribute("parent"), "X-COMPONENT");

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

        assert.equal(span.foo, "X-COMPONENT");
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

        host.shadowRoot.innerHTML = "<span ::value=\"host.value\"></span>";

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
    public elementWithTwoWayComputedDataBinding(): void
    {
        const host = getHost<{ value?: string }>();

        host.id = "host";
        host.id = "hostRoot";

        host.shadowRoot.innerHTML = "<span ::value=\"host['value']\"></span>";

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
    public elementWithEventDirectiveBind(): void
    {
        const host = getHost();

        let clicked = false;

        host.click = () => clicked = true;

        host.shadowRoot.innerHTML = "<span @click='host.click'>Text</span>";

        process(host, host.shadowRoot);

        host.shadowRoot.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
    }

    @test @shouldPass
    public elementWithEventDirectiveExpression(): void
    {
        const host = getHost<{ method?: Function }>();

        let clicked = false;

        host.method = (value: boolean) => clicked = value;

        host.shadowRoot.innerHTML = "<span @click='host.method(true)'>Text</span>";

        process(host, host.shadowRoot);

        host.shadowRoot.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
    }

    @test @shouldPass
    public elementWithEventDirectiveBindArrowFunction(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span @click='() => window.name = \"clicked\"'>Text</span>";

        process(host, host.shadowRoot);

        host.shadowRoot.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(window.name, "clicked");
    }

    @test @shouldPass
    public elementWithEventDirectiveBodyExpression(): void
    {
        const host = getHost<{ clicked: boolean }>();

        host.shadowRoot.innerHTML = "<span @click='host.clicked = true'>Text</span>";

        process(host, host.shadowRoot);

        host.shadowRoot.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(host.clicked, true);
    }

    @test @shouldPass
    public elementWithCustomDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span #custom:directive=\"'Hello World!!!'\"></span><span #custom-factory:factory-directive=\"'Hello World!!!'\"></span>";

        process(host, host.shadowRoot);

        assert.equal(host.shadowRoot.firstElementChild!.textContent, "directive: Hello World!!!");
        assert.equal(host.shadowRoot.lastElementChild!.textContent, "factory-directive: Hello World!!!");
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
    public templateWithoutDirective(): void
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
    public async templateWithPlaceholderDirectiveWithDefault(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        root.shadowRoot.appendChild(host);

        host.shadowRoot.innerHTML = "<span>Hello </span><template #placeholder:items>Default</template><span>!!!</span>";

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Hello Default!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        root.id = "root";
        host.id = "host";

        host.shadowRoot.innerHTML = "<span>Hello </span><template #placeholder:items></template><span>!!!</span>";
        host.innerHTML            = "<template #inject:items>World</template>";

        root.shadowRoot.appendChild(host);

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithDynamicInjectAndPlaceholderDirective(): Promise<void>
    {
        const root = getHost<{ injectKey: string }>();
        const host = getHost<{ placeholderKey: string }>();

        root.injectKey = "";
        host.placeholderKey = "key-a";

        host.shadowRoot.innerHTML = "<template #placeholder #placeholder-key='host.placeholderKey'>Placeholder Key: {host.placeholderKey}</template>";
        host.innerHTML            = "<template #inject #inject-key='host.injectKey'>Inject Key: {host.injectKey}</template>";

        root.shadowRoot.appendChild(host);

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Placeholder Key: key-a");

        root.injectKey = "key-a";

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Inject Key: key-a");

        root.injectKey = "key-b";

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Placeholder Key: key-a");

        root.injectKey = "key-a";
        host.placeholderKey = "key-b";

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Placeholder Key: key-b");

        host.placeholderKey = "key-a";

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Inject Key: key-a");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirectiveFowarding(): Promise<void>
    {
        const root      = getHost();
        const host      = getHost();
        const childHost = getHost<{ item?: [string, number] }>();

        childHost.shadowRoot.innerHTML =
        `
            <template #placeholder:items2="({ item: host.item })">
                <span>Placeholder 2</span>
            </template>
        `;

        childHost.innerHTML =
        `
            <template #inject:items2="{ item }">
                <template #placeholder:items1="({ item })">
                    <span>Placeholder 1</span>
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

        await whenDone();

        assert.equal(childHost.shadowRoot.querySelector("span")?.textContent, "Value: 1");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirectiveWithScope(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ item?: { value: string }}>();

        host.item = { value: "People" };

        host.innerHTML = "<template #inject:item='{ item }'>{item.value}</template>";

        host.shadowRoot.innerHTML = "<span>Hello </span><template #placeholder:item='({ item: host.item })'></template><span>!!!</span>";

        root.shadowRoot.appendChild(host);

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Hello People!!!");

        host.item = { value: "World" };

        await whenDone();

        assert.equal(host.shadowRoot.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndConditionalDirectives(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ items?: [string, number, boolean][] }>();

        host.innerHTML =
        `
            <template #inject:items="{ item: [key, value, visible] }">
                <template #if="visible">
                    <span>{key}: {value}</span>
                </template>
            </template>
        `;

        host.shadowRoot.innerHTML = "<template #for=\"const item of host.items\" #placeholder:items=\"({ item })\"></template>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        host.items = [];

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",  "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "#close", "childNodes[1]");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, true],
            ["Three", 3, true],
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",    "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "One: 1",   "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",   "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",    "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Two: 2",   "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",   "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",    "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Three: 3", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",   "childNodes[8]");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, false],
            ["Three", 3, true],
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",    "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "One: 1",   "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",   "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",    "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "#close",   "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#open",    "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "Three: 3", "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "#close",   "childNodes[7]");
    }

    @test @shouldPass
    public async templateWithConditionalDirective(): Promise<void>
    {
        const host = getHost<{ order?: number }>();

        host.order = 1;

        host.shadowRoot.innerHTML = "<template #if=\"host.order == 1\"><span>First</span></template><template>Ignore me</template>>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.firstElementChild?.textContent, "First");

        host.order = 2;

        await whenDone();

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

        host.shadowRoot.innerHTML = "<template #if=\"host.order == 1\">First</template><template #else-if=\"host.order == 2\">Second</template><template #else>Last</template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[1].textContent, "First");

        host.order = 2;

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[1].textContent, "Second");

        host.order = 3;

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[1].textContent, "Last");
    }

    @test @shouldPass
    public async templateWithForInLoopDirective(): Promise<void>
    {
        const host = getHost<{ elements?: number[] }>();

        host.elements = [1];

        host.shadowRoot.innerHTML = "<template #for=\"const index in host.elements\"><span>Element: {index}</span></template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 0", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");

        host.elements = [1, 2];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 0", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",      "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element: 1", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",     "childNodes[5]");

        host.elements = [1, 2, 3];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent,  "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent,  "Element: 0", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent,  "#close",     "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent,  "#open",      "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent,  "Element: 1", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent,  "#close",     "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent,  "#open",      "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent,  "Element: 2", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent,  "#close",     "childNodes[8]");

        host.elements = [2];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 0", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");
    }

    @test @shouldPass
    public async templateWithForOfLoopDirective(): Promise<void>
    {
        const host = getHost<{ elements?: number[] }>();

        host.elements = [1];

        host.shadowRoot.innerHTML = "<template #for=\"const index of host.elements\"><span>Element: {index}</span></template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 1", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");

        host.elements = [1, 2];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 1", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",      "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element: 2", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",     "childNodes[5]");

        host.elements = [1, 2, 3];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 1", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",      "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element: 2", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",     "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",      "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Element: 3", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",     "childNodes[8]");

        host.elements = [2];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");

        host.elements = [1, 2, 3];

        await whenDone();

        host.elements = [3, 2, 1];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",      "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 3", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",     "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",      "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element: 2", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",     "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",      "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Element: 1", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",     "childNodes[8]");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuring(): Promise<void>
    {
        const host = getHost<{ elements?: [number, number][] }>();

        host.elements = [[1, 2]];

        host.shadowRoot.innerHTML = "<template #for=\"const [index0, index1] of host.elements\"><span>Element[0]: {index0}, Element[1]: {index1}</span></template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");

        host.elements = [[1, 2], [2, 4]];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                        "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                       "childNodes[5]");

        host.elements = [[1, 2], [2, 4], [3, 6]];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                        "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                       "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",                        "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Element[0]: 3, Element[1]: 6", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",                       "childNodes[8]");

        host.elements = [[2, 4]];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuringDeepNested(): Promise<void>
    {
        const host = getHost<{ elements?: [number, { item: { name: string } }][] }>();

        host.elements = [[1, { item: { name: "one" } }]];

        host.shadowRoot.innerHTML = "<template #for=\"const [index, { item: { name } }] of host.elements\"><span>Element: {index}, Name: {name}</span></template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                 "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 1, Name: one", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                "childNodes[2]");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }],
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                 "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 1, Name: one", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                 "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element: 2, Name: two", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                "childNodes[5]");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }],
            [3, { item: { name: "three" } }],
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                   "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 1, Name: one",   "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                  "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                   "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element: 2, Name: two",   "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                  "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",                   "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Element: 3, Name: three", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",                  "childNodes[8]");

        host.elements = [[2, { item: { name: "two" } }]];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                 "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element: 2, Name: two", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                "childNodes[2]");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuring(): Promise<void>
    {
        const host = getHost<{ elements?: { values: [number, number]}[] }>();

        host.elements = [{ values: [1, 2] }];

        host.shadowRoot.innerHTML = "<template #for=\"const { values: [value1, value2] } of host.elements\"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                        "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                       "childNodes[5]");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
            { values: [3, 6] },
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                        "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                       "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",                        "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Element[0]: 3, Element[1]: 6", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",                       "childNodes[8]");

        host.elements = [{ values: [2, 4] }];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuringDeepNested(): Promise<void>
    {
        const host = getHost<{ elements?: { values: [number, [[number]]]}[] }>();

        host.elements = [{ values: [1, [[2]]] }];

        host.shadowRoot.innerHTML = "<template #for=\"const { values: [value1, [[value2]]] } of host.elements\"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>";

        process(host, host.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] },
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                        "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                       "childNodes[5]");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] },
            { values: [3, [[6]]] },
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 1, Element[1]: 2", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open",                        "childNodes[3]");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[4]");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close",                       "childNodes[5]");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open",                        "childNodes[6]");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Element[0]: 3, Element[1]: 6", "childNodes[7]");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close",                       "childNodes[8]");

        host.elements = [{ values: [2, [[4]]] }];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open",                        "childNodes[0]");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Element[0]: 2, Element[1]: 4", "childNodes[1]");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close",                       "childNodes[2]");
    }

    @test @shouldPass
    public async templateWithConditionalAndLoopDirectives(): Promise<void>
    {
        const host = getHost<{ condition?: boolean, items?: [string, number][] }>();

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

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Empty");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");

        host.condition = true;

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "One: 1");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Two: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Three: 3");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close");

        host.condition = false;

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Empty");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");
    }

    @test @shouldPass
    public async templateWithConditionalAndPlaceholderDirectives(): Promise<void>
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
            <template #if="host.condition" #placeholder:items="({ item: host.item })">
                <span>Default</span>
            </template>
        `;

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        host.condition = false;
        host.item      = ["One", 1];

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "#close");

        host.condition = true;

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "One: 1");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");
    }

    @test @shouldPass
    public async templateWithLoopAndConditionalDirectives(): Promise<void>
    {
        const host = getHost<{ condition?: boolean, items?: [string, number][] }>();

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

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "Empty");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");

        host.condition = true;

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "One: 1");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Two: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Three: 3");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close");
    }

    @test @shouldPass
    public async templateWithLoopAndPlaceholderDirectives(): Promise<void>
    {
        const root = getHost();
        const host = getHost<{ condition?: boolean, items?: [string, number][] }>();

        host.innerHTML    =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `;

        host.shadowRoot.innerHTML =
        `
            <template #for="const item of host.items" #placeholder:items="({ item })">
                <span>Default</span>
            </template>
        `;

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        host.condition = false;
        host.items     = [];

        process(host, host.shadowRoot);
        process(root, root.shadowRoot);

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "#close");

        host.items =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        await whenDone();

        assert.equal(host.shadowRoot.childNodes[0].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[1].textContent, "One: 1");
        assert.equal(host.shadowRoot.childNodes[2].textContent, "#close");
        assert.equal(host.shadowRoot.childNodes[3].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[4].textContent, "Two: 2");
        assert.equal(host.shadowRoot.childNodes[5].textContent, "#close");
        assert.equal(host.shadowRoot.childNodes[6].textContent, "#open");
        assert.equal(host.shadowRoot.childNodes[7].textContent, "Three: 3");
        assert.equal(host.shadowRoot.childNodes[8].textContent, "#close");
    }

    @test @shouldPass
    public async elementWithLazyDefinition(): Promise<void>
    {
        const host = document.createElement("div");

        document.body.appendChild(host);

        const DUMMY_CHILD  = `dummy-child-${uuidv4()}`;
        const DUMMY_PARENT = `dummy-parent-${uuidv4()}`;
        const X_ELEMENT    = `x-element-${uuidv4()}`;

        @element(DUMMY_CHILD)
        class DummyChild extends CustomElement
        { }

        @element(DUMMY_PARENT)
        class DummyParent extends CustomElement
        { }

        const template =
        `
            <template #for="const i in host.indexes">
                <${DUMMY_PARENT}>
                    <${DUMMY_CHILD} data-index="{i}">
                    </${DUMMY_CHILD}>
                </${DUMMY_PARENT}>
            </template>
        `;

        @element(X_ELEMENT, template)
        class XElement extends CustomElement
        {
            public indexes: number[] = [1, 2, 3];
        }

        const xelement = new XElement();

        await whenDone();

        host.appendChild(xelement);

        assert.instanceOf(host.firstElementChild, XElement);
        assert.instanceOf(host.firstElementChild!.shadowRoot!.firstElementChild, DummyParent);
        assert.instanceOf(host.firstElementChild!.shadowRoot!.firstElementChild!.firstElementChild, DummyChild);
    }

    @test @shouldFail
    public evaluationErrorOneWayDataBinding(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span :name='host.foo()'></span>";

        const message = "Evaluation error in :name=\"host.foo()\": host.foo is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <span :name=\"host.foo()\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public evaluationErrorEventBind(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span @click=\"host.fn\"></span>";

        const message = "Evaluation error in @click=\"host.fn\": host.fn is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <span @click=\"host.fn\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public evaluationErrorCustomDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span #custom:directive=\"({ value })\"></span>";

        const message = "Evaluation error in #custom:directive=\"({ value })\": value is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <span #custom:directive=\"({ value })\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public evaluationErrorTextNodeInterpolation(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span><h1>This is a text {host.interpolation()}</h1></span>";

        const message = "Evaluation error in This is a text {host.interpolation()}: host.interpolation is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <span>\n         <h1>\n            This is a text {host.interpolation()}";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorChoiceDirective(): Promise<void>
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<h1>Title</h1><template #for='index of [1]' #if='host.isOk()'></template>";

        const message = "Evaluation error in #if=\"host.isOk()\": host.isOk is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <template #for=\"index of [1]\" #if=\"host.isOk()\">";

        const actual   = await tryActionAsync(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorLoopDirective(): Promise<void>
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<h1>Title</h1><span #for='index of host.elements()'></span>";

        const message = "Evaluation error in #for=\"index of host.elements()\": host.elements is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #for=\"index of host.elements()\">";

        const actual   = await tryActionAsync(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorDestructuredLoopDirective(): Promise<void>
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<h1>Title</h1><span #for='{ x = host.getValue() } of [{ }]'></span>";

        const message = "Evaluation error in #for=\"{ x = host.getValue() } of [{ }]\": host.getValue is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #for=\"{ x = host.getValue() } of [{ }]\">";

        const actual   = await tryActionAsync(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorPlaceholderDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject:items=\"{ item: [key, value] }\"></template>";

        host.shadowRoot.innerHTML = "<div class=\"foo\"><span></span><template #placeholder:items=\"({ item })\"></template></div>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        process(host, host.shadowRoot);

        const message = "Evaluation error in #placeholder:items=\"({ item })\": item is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <div class=\"foo\">\n         ...1 other(s) node(s)\n         <template #placeholder:items=\"({ item })\">";

        const actual   = await tryActionAsync(() => process(root, root.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationPlaceholderKeyDirective(): Promise<void>
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<h1>Title</h1><template #placeholder #placeholder-key='key'></template>";

        const message = "Evaluation error in #placeholder-key=\"key\": key is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <template #placeholder #placeholder-key=\"key\">";

        const actual   = await tryActionAsync(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorInjectDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject:items=\"{ item: value = lastItem }\"></template>";

        host.shadowRoot.innerHTML = "<div class=\"foo\"><span></span><template #placeholder:items=\"({ })\"></template></div>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        process(host, host.shadowRoot);

        const message = "Evaluation error in #inject:items=\"{ item: value = lastItem }\": lastItem is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <x-component>\n         <template #inject:items=\"{ item: value = lastItem }\">";

        const actual   = await tryActionAsync(() => process(root, root.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorInjectKeyDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject #inject-key='key'></template>";

        host.shadowRoot.innerHTML = "<div class=\"foo\"><span></span><template #placeholder></template></div>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        process(host, host.shadowRoot);

        const message = "Evaluation error in #inject-key=\"key\": key is not defined";
        const stack   = "<x-component>\n   #shadow-root\n      <x-component>\n         <template #inject #inject-key=\"key\">";

        const actual   = await tryActionAsync(() => process(root, root.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorOneWayReadonlyProperty(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span :node-type='host.value'></span>";

        const message = "Binding error in :node-type=\"host.value\": Property \"nodeType\" of <span> is readonly";
        const stack   = "<x-component>\n   #shadow-root\n      <span :node-type=\"host.value\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorOneWayReadonlyPropertyInsideTemplate(): Promise<void>
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span #if='true' :node-type='host.value'></span>";

        const message = "Binding error in :node-type=\"host.value\": Property \"nodeType\" of <span> is readonly";
        const stack   = "<x-component>\n   #shadow-root\n      <span #if=\"true\" :node-type=\"host.value\">";

        const actual   = await tryActionAsync(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorTwoWayReadonlyProperty(): void
    {
        const host = getHost();

        Object.defineProperty(host, "value", { value: "", writable: false });

        host.shadowRoot.innerHTML = "<span ::value='host.value'></span>";

        const message = "Binding error in ::value=\"host.value\": Property \"value\" of XComponent is readonly";
        const stack   = "<x-component>\n   #shadow-root\n      <span ::value=\"host.value\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorTwoWayReadonlyPropertyInsideTemplate(): Promise<void>
    {
        const host = getHost<{ value?: string }>();

        Object.defineProperty(host, "value", { value: "", writable: false });

        host.shadowRoot.innerHTML = "<span #for='const letter in host.nodeName' #if='true' ::value='host.value'></span>";

        const message = "Binding error in ::value=\"host.value\": Property \"value\" of XComponent is readonly";
        const stack   = "<x-component>\n   #shadow-root\n      <span #for=\"const letter in host.nodeName\" #if=\"true\" ::value=\"host.value\">";

        const actual   = await tryActionAsync(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorOneWayBinding(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span :name='host.value1'></span>";

        const message = "Observation error in :name=\"host.value1\": Property \"value1\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <span :name=\"host.value1\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorTwoWayBinding(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span ::name='host.value1'></span>";

        const message = "Binding error in ::name=\"host.value1\": Property \"value1\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <span ::name=\"host.value1\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorAttributeInterpolation(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span name='value: {host.value1}'></span>";

        const message = "Observation error in name=\"value: {host.value1}\": Property \"value1\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <span name=\"value: {host.value1}\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorTextNodeInterpolation(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span>{host.value1}</span>";

        const message = "Observation error in {host.value1}: Property \"value1\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <span>\n         {host.value1}";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorPlaceholderDirective(): void
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject></template>";

        host.shadowRoot.innerHTML = "<template #placeholder:item=\"({ item: host.item })\"></template>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        const message = "Observation error in #placeholder:item=\"({ item: host.item })\": Property \"item\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <template #placeholder:item=\"({ item: host.item })\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorPlaceholderKeyDirective(): void
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject></template>";

        host.shadowRoot.innerHTML = "<template #placeholder #placeholder-key=\"host.key\"></template>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        const message = "Observation error in #placeholder-key=\"host.key\": Property \"key\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <template #placeholder #placeholder-key=\"host.key\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async observationErrorInjectDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject=\"{ item = host.item }\"></template>";

        host.shadowRoot.innerHTML = "<template #placeholder></template>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        process(host, host.shadowRoot);

        const message = "Observation error in #inject=\"{ item = host.item }\": Property \"item\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <x-component>\n         <template #inject=\"{ item = host.item }\">";

        const actual   = await tryActionAsync(() => process(root, root.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async observationErrorInjectKeyDirective(): Promise<void>
    {
        const root = getHost();
        const host = getHost();

        host.innerHTML = "<template #inject #inject-key=\"host.key\"></template>";

        host.shadowRoot.innerHTML = "<template #placeholder></template>";

        root.shadowRoot.appendChild(host);
        document.body.appendChild(root);

        process(host, host.shadowRoot);

        const message = "Observation error in #inject-key=\"host.key\": Property \"key\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <x-component>\n         <template #inject #inject-key=\"host.key\">";

        const actual   = await tryActionAsync(() => process(root, root.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorChoiceDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<template #if=\"host.key\"></template>";

        const message = "Observation error in #if=\"host.key\": Property \"key\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <template #if=\"host.key\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorLoopDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<template #for=\"const keys of host.key\"></template>";

        const message = "Observation error in #for=\"const keys of host.key\": Property \"key\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <template #for=\"const keys of host.key\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorCustomDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span #custom=\"host.key\"></span>";

        const message = "Observation error in #custom=\"host.key\": Property \"key\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <span #custom=\"host.key\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public observationErrorCustomKeyDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<span #custom #custom-key=\"host.key\"></span>";

        const message = "Observation error in #custom-key=\"host.key\": Property \"key\" does not exists on type XComponent";
        const stack   = "<x-component>\n   #shadow-root\n      <span #custom #custom-key=\"host.key\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public unresgisteredDirective(): void
    {
        const host = getHost();

        host.shadowRoot.innerHTML = "<div><div></div><section><span #foo='bar'></span></section></div>";

        const message = "Unregistered directive #foo.";
        const stack   = "<x-component>\n   #shadow-root\n      <div>\n         ...1 other(s) node(s)\n         <section>\n            <span #foo=\"bar\">";

        const actual   = tryAction(() => process(host, host.shadowRoot));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }
}