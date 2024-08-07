/* eslint-disable max-lines */
// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import type { Constructor, Delegate, IDisposable } from "@surface/core";
import { resolveError }                            from "@surface/core";
import { shouldFail, shouldPass, suite, test }     from "@surface/test-suite";
import { assert }                                  from "chai";
import semver                                      from "semver";
import Compiler                                    from "../internal/compiler.js";
import LoopDirective                               from "../internal/directives/loop-directive.js";
import CustomStackError                            from "../internal/errors/custom-stack-error.js";
import TemplateEvaluationError                     from "../internal/errors/template-evaluation-error.js";
import { scheduler }                               from "../internal/singletons.js";
import type DirectiveEntry                         from "../internal/types/directive-entry.js";
import customDirectiveFactory                      from "./fixtures/custom-directive-factory.js";
import CustomDirective                             from "./fixtures/custom-directive.js";

const customDirectivesRegistry = new Map<string, DirectiveEntry>();

declare const process: { version: string };

// @ts-ignore
LoopDirective.maximumAmount = 2;

type RawError = { message: string } | Pick<CustomStackError, "message" | "stack">;

class YComponent extends HTMLElement { }

window.customElements.define("y-component", YComponent);

customDirectivesRegistry.set("custom", CustomDirective as unknown as DirectiveEntry);
customDirectivesRegistry.set("custom-factory", customDirectiveFactory as unknown as DirectiveEntry);

function tryAction(action: Delegate): RawError
{
    try
    {
        action();
    }
    catch (error)
    {
        return toRaw(resolveError(error));
    }

    return toRaw(new CustomStackError("", ""));
}

async function tryActionAsync(action: Delegate): Promise<RawError>
{
    try
    {
        action();

        await scheduler.execution();

    }
    catch (error)
    {
        if (error instanceof AggregateError)
        {
            await scheduler.enqueue(() => void 0, "high"); // Reset State

            return toRaw(error.errors[0]!);
        }

        return toRaw(resolveError(error));
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

function createNode(): HTMLElement
{
    const node = document.createElement("y-component");

    node.attachShadow({ mode: "open" });

    return node;
}

function defineComponent(tag: `${string}-${string}`, template: string = ""): Constructor<HTMLElement>
{
    const factory = Compiler.compile(tag, template);

    class Component extends HTMLElement implements IDisposable
    {
        private readonly disposable: IDisposable;
        public constructor()
        {
            super();

            this.attachShadow({ mode: "open" });

            const { activator, content } = factory.create();

            this.shadowRoot!.appendChild(content);

            this.disposable = activator(this.shadowRoot!, this, { host: this }, new Map());
        }

        public dispose(): void
        {
            this.disposable.dispose();
        }
    }

    customElements.define(tag, Component);

    return Component;
}

type CompileOptions =
{
    host:         Element,
    shadowRoot?:  string,
    innerHTML?:   string,
    parentHost?:  Element,
};

function compile(options: CompileOptions): void
{
    if (options.shadowRoot)
    {
        const { content, activator } = Compiler.compile(options.host.nodeName.toLowerCase(), options.shadowRoot).create();

        options.host.shadowRoot!.appendChild(content);

        activator(options.host.shadowRoot!, options.host, { host: options.host }, customDirectivesRegistry);
    }

    if (options.innerHTML)
    {
        const parentHost: Node = options.parentHost ?? document.createElement("parent-host");

        const { content, activator } = Compiler.compile(parentHost.nodeName.toLowerCase(), options.innerHTML).create();

        options.host.appendChild(content);

        activator(options.host, parentHost, { host: parentHost }, customDirectivesRegistry);
    }
}

@suite
export default class CompilerSpec
{
    @test @shouldPass
    public elementWithComment(): void
    {
        const host = createNode();

        const shadowRoot = "<!--This is A comment-->";

        compile({ host, shadowRoot });

        assert.equal(host.shadowRoot!.firstChild!.textContent, "This is A comment");
    }

    @test @shouldPass
    public elementWithAttributes(): void
    {
        const host = createNode();

        const shadowRoot = "<span value='1'>Text</span>";

        compile({ host, shadowRoot });

        assert.equal(host.shadowRoot!.firstElementChild!.getAttribute("value"), "1");
    }

    @test @shouldPass
    public async elementWithAttributeInterpolation(): Promise<void>
    {
        const host = createNode();

        host.lang = "pt-br";

        const shadowRoot = "<input type='text' lang='{host.lang}' parent='{host.tagName}'>Text</input>";

        compile({ host, shadowRoot });

        const input = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        assert.equal(input.lang, "pt-br");
        assert.equal(input.getAttribute("lang"), "pt-br");
        assert.equal(input.getAttribute("parent"), "Y-COMPONENT");

        host.lang = "en-us";

        await scheduler.execution();

        assert.equal(input.lang, "en-us");
        assert.equal(input.getAttribute("lang"), "en-us");
    }

    @test @shouldPass
    public async elementWithAttributeCompoundInterpolation(): Promise<void>
    {
        const host = createNode();

        host.lang = "pt-br";
        const shadowRoot = "<span data-text='Tag lang: {host.lang}'>Text</span>";

        compile({ host, shadowRoot });

        assert.equal(host.shadowRoot!.firstElementChild!.getAttribute("data-text"), "Tag lang: pt-br");

        host.lang = "en-us";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild!.getAttribute("data-text"), "Tag lang: en-us");
    }

    @test @shouldPass
    public elementWithAttributeInterpolationExpression(): void
    {
        const host = createNode();

        const shadowRoot = "<span has-children='Has children: {host.shadowRoot.firstElementChild.childNodes.length > 0}'></span>";

        compile({ host, shadowRoot });

        const span = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        assert.equal(span.getAttribute("has-children"), "Has children: false");
    }

    @test @shouldPass
    public elementWithOneWayDataBinding(): void
    {
        const host = createNode();

        const shadowRoot = "<span :title='host.tagName'></span>";

        compile({ host, shadowRoot });

        const span = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        assert.equal(span.title, "Y-COMPONENT");
    }

    @test @shouldPass
    public elementWithClassOneWayDataBinding(): void
    {
        const host = createNode();

        const shadowRoot = "<span :class='{ closed: true }'></span>";

        compile({ host, shadowRoot });

        const span = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        assert.isTrue(span.classList.contains("closed"));
    }

    @test @shouldPass
    public elementWithStyleOneWayDataBinding(): void
    {
        const host = createNode();

        const shadowRoot = "<span :style='{ display: `none` }'></span>";

        compile({ host, shadowRoot });

        const span = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        assert.equal(span.style.display, "none");
    }

    @test @shouldPass
    public async elementWithTwoWayDataBinding(): Promise<void>
    {
        const host = createNode();

        host.id = "host";

        const shadowRoot = "<span ::title=\"host.title\"></span>";

        compile({ host, shadowRoot });

        const span = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        host.title = "foo";

        await scheduler.execution();

        assert.equal(span.title, "foo");

        span.title = "foo";

        await scheduler.execution();

        assert.equal(host.title, "foo");
    }

    @test @shouldPass
    public async elementWithTwoWayComputedDataBinding(): Promise<void>
    {
        const host = createNode();

        host.id = "host";
        host.id = "hostRoot";

        const shadowRoot = "<span ::title=\"host['title']\"></span>";

        compile({ host, shadowRoot });

        const span = host.shadowRoot!.firstElementChild as HTMLSpanElement;

        host.title = "foo";

        await scheduler.execution();

        assert.equal(span.title, "foo");

        span.title = "foo";

        await scheduler.execution();

        assert.equal(host.title, "foo");
    }

    @test @shouldPass
    public elementWithEventDirectiveBind(): void
    {
        const host = createNode();

        let clicked = false;

        host.click = () => clicked = true;

        const shadowRoot = "<span @click='host.click'>Text</span>";

        compile({ host, shadowRoot });

        host.shadowRoot!.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(clicked, true);
    }

    @test @shouldPass
    public elementWithEventDirectiveBindArrowFunction(): void
    {
        const host = createNode();

        const shadowRoot = "<span @click='() => host.title = \"clicked\"'>Text</span>";

        compile({ host, shadowRoot });

        host.shadowRoot!.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(host.title, "clicked");
    }

    @test @shouldPass
    public elementWithEventDirectiveBodyExpression(): void
    {
        const host = createNode();

        const shadowRoot = "<span @click='host.title = \"clicked\"'>Text</span>";

        compile({ host, shadowRoot });

        host.shadowRoot!.firstElementChild!.dispatchEvent(new Event("click"));

        assert.equal(host.title, "clicked");
    }

    @test @shouldPass
    public async elementWithCustomDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<span #custom=\"'Hello World!!!'\"></span><span #custom-factory=\"'Hello World!!!'\"></span>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild!.textContent, "custom: Hello World!!!");
        assert.equal(host.shadowRoot!.lastElementChild!.textContent, "custom-factory: Hello World!!!");
    }

    @test @shouldPass
    public async elementWithTextNodeInterpolation(): Promise<void>
    {
        const host = createNode();

        host.id = "01";
        const shadowRoot = "<span>Host id: {host.id}</span>";

        compile({ host, shadowRoot });

        assert.equal(host.shadowRoot!.firstElementChild!.innerHTML, "Host id: 01");

        host.id = "02";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild!.innerHTML, "Host id: 02");
    }

    @test @shouldPass
    public async elementWithTextNodeInterpolationExpression(): Promise<void>
    {
        const host = createNode();

        host.id = "01";
        const shadowRoot = "<span>{host.id == '01'}</span>";

        compile({ host, shadowRoot });

        assert.equal(host.shadowRoot!.firstElementChild!.innerHTML, "true");

        host.id = "02";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild!.innerHTML, "false");
    }

    @test @shouldPass
    public async templateWithSpreadAttributesDirective(): Promise<void>
    {
        const host = createNode();

        host.id = "host";

        host.setAttribute("foo", "foo");
        host.setAttribute("bar", "bar");

        const shadowRoot = "<div ...attributes='host'>World</div>";

        compile({ host, shadowRoot });

        await scheduler.execution();
        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild?.getAttribute("foo"), "foo");
        assert.equal(host.shadowRoot!.firstElementChild?.getAttribute("bar"), "bar");

        host.removeAttribute("foo");
        host.setAttribute("baz", "baz");

        await scheduler.execution();
        await scheduler.execution(); // TODO: Investigate mutation observer event loop.

        assert.isFalse(host.shadowRoot!.firstElementChild?.hasAttribute("foo"));
        assert.equal(host.shadowRoot!.firstElementChild?.getAttribute("bar"), "bar");
        assert.equal(host.shadowRoot!.firstElementChild?.getAttribute("baz"), "baz");
    }

    @test @shouldPass
    public async templateWithSpreadOnewayPropertiesDirective(): Promise<void>
    {
        const hash = crypto.randomUUID();

        const ROOT_TAG  = `x-root-${hash}`  as const;
        const HOST_TAG  = `x-host-${hash}`  as const;
        const CHILD_TAG = `x-child-${hash}` as const;

        defineComponent(CHILD_TAG);
        defineComponent(HOST_TAG,  `<${CHILD_TAG} ...properties='host'></${CHILD_TAG}>`);
        defineComponent(ROOT_TAG,  `<${HOST_TAG} :lang='host.lang'></${HOST_TAG}>`);

        const root  = document.createElement(ROOT_TAG);
        const host  = root.shadowRoot!.firstElementChild as HTMLElement;
        const child = host.shadowRoot!.firstElementChild as HTMLElement;

        await scheduler.execution();

        assert.equal(root.lang, "");
        assert.equal(host.lang, "");
        assert.equal(child.lang, "");

        child.lang = "en-uk";

        await scheduler.execution();

        assert.equal(root.lang, "");
        assert.equal(host.lang, "");
        assert.equal(child.lang, "en-uk");

        host.lang = "en-us";

        await scheduler.execution();

        assert.equal(root.lang, "");
        assert.equal(host.lang, "en-us");
        assert.equal(child.lang, "en-uk");

        root.lang = "pt-br";

        await scheduler.execution();

        assert.equal(root.lang, "pt-br");
        assert.equal(host.lang, "pt-br");
        assert.equal(child.lang, "pt-br");
    }

    @test @shouldPass
    public async templateWithSpreadTwoWayPropertiesDirective(): Promise<void>
    {
        const hash = crypto.randomUUID();

        const ROOT_TAG  = `x-root-${hash}`  as const;
        const HOST_TAG  = `x-host-${hash}`  as const;
        const CHILD_TAG = `x-child-${hash}` as const;

        defineComponent(CHILD_TAG);
        defineComponent(HOST_TAG, `<${CHILD_TAG} ...properties='host'></${CHILD_TAG}>`);
        defineComponent(ROOT_TAG, `<${HOST_TAG} ::lang='host.lang'></${HOST_TAG}>`);

        const root  = document.createElement(ROOT_TAG);
        const host  = root.shadowRoot!.firstElementChild as HTMLElement;
        const child = host.shadowRoot!.firstElementChild as HTMLElement;

        await scheduler.execution();

        assert.equal(root.lang, "");
        assert.equal(host.lang, "");
        assert.equal(child.lang, "");

        child.lang = "pt-br";

        await scheduler.execution();

        assert.equal(root.lang, "pt-br");
        assert.equal(host.lang, "pt-br");
        assert.equal(child.lang, "pt-br");

        host.lang = "en-us";

        await scheduler.execution();

        assert.equal(root.lang, "en-us");
        assert.equal(host.lang, "en-us");
        assert.equal(child.lang, "en-us");

        root.lang = "en-uk";

        await scheduler.execution();

        assert.equal(root.lang, "en-uk");
        assert.equal(host.lang, "en-uk");
        assert.equal(child.lang, "en-uk");
    }

    @test @shouldPass
    public async templateWithSpreadListenersDirective(): Promise<void>
    {
        const hash = crypto.randomUUID();

        const ROOT_TAG  = `x-root-${hash}`  as const;
        const HOST_TAG  = `x-host-${hash}`  as const;
        const CHILD_TAG = `x-child-${hash}` as const;

        defineComponent(CHILD_TAG);
        defineComponent(HOST_TAG, `<${CHILD_TAG} ...listeners='host'></${CHILD_TAG}>`);
        defineComponent(ROOT_TAG, `<${HOST_TAG} @click='e => host.title = e.target.nodeName'></${HOST_TAG}>`);

        const root  = document.createElement(ROOT_TAG);
        const host  = root.shadowRoot!.firstElementChild as HTMLElement;
        const child = host.shadowRoot!.firstElementChild as HTMLElement;

        await scheduler.execution();

        host.dispatchEvent(new Event("click"));

        assert.equal(root.title, host.nodeName);

        child.dispatchEvent(new Event("click"));

        assert.equal(root.title, child.nodeName);
    }

    @test @shouldPass
    public async templateWithPlaceholderDirectiveWithDefault(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<span>Hello </span><template #placeholder:items>Default</template><span>!!!</span>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Hello Default!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirective(): Promise<void>
    {
        const host  = createNode();

        host.id = "host";

        const shadowRoot  = "<span>Hello </span><template #placeholder:items></template><span>!!!</span>";
        const innerHTML = "<template #inject:items>World</template>";

        compile({ host, innerHTML, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirectiveWithAliasedScope(): Promise<void>
    {
        const host = createNode();

        host.id = "host";

        const shadowRoot = "<span>Hello </span><template #placeholder:items='{ name: \"World\" }'></template><span>!!!</span>";
        const innerHTML  = "<template #inject:items='scope'>{scope.name}</template>";

        compile({ host, innerHTML, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithDynamicInjectAndPlaceholderDirective(): Promise<void>
    {
        const parentHost = createNode();
        const host       = createNode();

        parentHost.shadowRoot!.appendChild(host);

        host.id = "key-a";

        const shadowRoot = "<template #placeholder.key='host.id'>Placeholder Key: {host.id}</template>";
        const innerHTML  = "<template #inject.key='host.id'>Inject Key: {host.id}</template>";

        compile({ host, innerHTML, parentHost, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Placeholder Key: key-a");

        parentHost.id = "key-a";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Inject Key: key-a");

        parentHost.id = "key-b";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Placeholder Key: key-a");

        parentHost.id = "key-a";
        host.id = "key-b";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Placeholder Key: key-b");

        host.id = "key-a";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Inject Key: key-a");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirectiveForwarding(): Promise<void>
    {
        const hash = crypto.randomUUID();

        const ROOT_TAG  = `x-root-${hash}`  as const;
        const HOST_TAG  = `x-host-${hash}`  as const;
        const CHILD_TAG = `x-child-${hash}` as const;

        defineComponent(CHILD_TAG, "<span #placeholder:item=\"{ title: 'forwarded' }\">Placeholder</span>");
        defineComponent(HOST_TAG, `<${CHILD_TAG}><span #inject:item="scope" #placeholder:item="scope">Injected Placeholder</span></${CHILD_TAG}>`);
        defineComponent(ROOT_TAG, `<${HOST_TAG}><span #inject:item="{ title }">Title: {title}</span></${HOST_TAG}>`);

        const root  = document.createElement(ROOT_TAG);
        const host  = root.shadowRoot!.firstElementChild as HTMLElement;
        const child = host.shadowRoot!.firstElementChild as HTMLElement;

        await scheduler.execution();

        assert.equal(child.shadowRoot!.firstElementChild!.textContent, "Title: forwarded");
    }

    @test @shouldPass
    public async templateWithInjectAndPlaceholderDirectiveWithScope(): Promise<void>
    {
        const parentHost = createNode();
        const host       = createNode() as HTMLElement & { item?: { value: string } };

        parentHost.shadowRoot!.appendChild(host);

        host.item = { value: "People" };

        const shadowRoot = "<span>Hello </span><template #placeholder:item='{ item: host.item }'></template><span>!!!</span>";
        const innerHTML  = "<template #inject:item='{ item }'>{item.value}</template>";

        compile({ host, innerHTML, parentHost, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Hello People!!!");

        host.item = { value: "World" };

        await scheduler.execution();

        assert.equal(host.shadowRoot!.textContent, "Hello World!!!");
    }

    @test @shouldPass
    public async templateWithInjectAndConditionalDirectives(): Promise<void>
    {
        const parentHost = createNode();
        const host       = createNode() as HTMLElement & { items?: [string, number, boolean][] };

        parentHost.shadowRoot!.appendChild(host);

        const shadowRoot = "<template #for=\"const item of host.items\" #placeholder:items=\"{ item }\"></template>";
        const innerHTML  =
        `
            <template #inject:items="{ item: [key, value, visible] }">
                <template #if="visible">
                    <span>{key}: {value}</span>
                </template>
            </template>
        `;

        host.items = [];

        compile({ host, innerHTML, parentHost, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.childNodes[0]!.textContent, "#start", "childNodes[0]");
        assert.equal(host.shadowRoot!.childNodes[1]!.textContent, "#end",   "childNodes[1]");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, true],
            ["Three", 3, true],
        ];

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "One: 1",
            "#end",
            "#start",
            "Two: 2",
            "#end",
            "#start",
            "Three: 3",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.items =
        [
            ["One",   1, true],
            ["Two",   2, false],
            ["Three", 3, true],
        ];

        await scheduler.execution();

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent!.trim()).filter(x => !!x);

        const expected2 =
        [
            "#start",
            "#start",
            "One: 1",
            "#end",
            "#start",
            "#end",
            "#start",
            "Three: 3",
            "#end",
            "#end",
        ];

        assert.deepEqual(actual2, expected2, "#2");
    }

    @test @shouldPass
    public async templateWithConditionalDirective(): Promise<void>
    {
        const host = createNode() as HTMLElement & { order?: number };

        host.order = 1;

        const shadowRoot = "<template #if=\"host.order == 1\"><span>First</span></template><template>Ignore me</template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild?.textContent, "First");

        host.order = 2;

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild?.textContent, "");

        host.shadowRoot!.innerHTML = "";

        host.order = 0;

        assert.equal(host.shadowRoot!.childNodes.length, 0);
    }

    @test @shouldPass
    public async templateWithMultiplesConditionalDirective(): Promise<void>
    {
        const host = createNode() as HTMLElement & { order?: number };

        host.order = 1;

        const shadowRoot = "<template #if=\"host.order == 1\">First</template><template #else-if=\"host.order == 2\">Second</template><template #else>Last</template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.childNodes[1]!.textContent, "First");

        host.order = 2;

        await scheduler.execution();

        assert.equal(host.shadowRoot!.childNodes[1]!.textContent, "Second");

        host.order = 3;

        await scheduler.execution();

        assert.equal(host.shadowRoot!.childNodes[1]!.textContent, "Last");
    }

    @test @shouldPass
    public async templateWithReusedConditionalDirective(): Promise<void>
    {
        const host = createNode() as HTMLElement & { description?: string };

        host.description = "";

        const shadowRoot = "<span #if=\"host.description\">Text</span>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild, null);

        host.description = "Not Empty";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild!.textContent, "Text");

        host.description = "Still Not Empty";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild!.textContent, "Text");

        host.description = "";

        await scheduler.execution();

        assert.equal(host.shadowRoot!.firstElementChild, null);
    }

    @test @shouldPass
    public async templateWithForInLoopDirective(): Promise<void>
    {
        const host = createNode() as HTMLElement & { elements?: number[] };

        host.elements = [1];

        const shadowRoot = "<template #for=\"const index in host.elements\"><span>Element: {index}</span></template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "Element: 0",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.elements = [1, 2];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Element: 0",
            "#end",
            "#start",
            "Element: 1",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.elements = [1, 2, 3];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Element: 0",
            "#end",
            "#start",
            "Element: 1",
            "#end",
            "#start",
            "Element: 2",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");

        host.elements = [2];

        await scheduler.execution();

        const expected4 =
        [
            "#start",
            "#start",
            "Element: 0",
            "#end",
            "#end",
        ];

        const actual4 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual4, expected4, "#4");
    }

    @test @shouldPass
    public async templateWithForOfLoopDirective(): Promise<void>
    {
        const host = createNode() as HTMLElement & { elements?: number[] };

        host.elements = [1];

        const shadowRoot = "<template #for=\"const index of host.elements\"><span>Element: {index}</span></template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "Element: 1",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.elements = [1, 2];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Element: 1",
            "#end",
            "#start",
            "Element: 2",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.elements = [1, 2, 3];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Element: 1",
            "#end",
            "#start",
            "Element: 2",
            "#end",
            "#start",
            "Element: 3",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");

        host.elements = [2];

        await scheduler.execution();

        const expected4 =
        [
            "#start",
            "#start",
            "Element: 2",
            "#end",
            "#end",
        ];

        const actual4 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual4, expected4, "#4");

        host.elements = [1, 2, 3];

        await scheduler.execution();

        const expected5 =
        [
            "#start",
            "#start",
            "Element: 1",
            "#end",
            "#start",
            "Element: 2",
            "#end",
            "#start",
            "Element: 3",
            "#end",
            "#end",
        ];

        const actual5 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual5, expected5, "#5");

        host.elements = [3, 2, 1];

        await scheduler.execution();

        const expected6 =
        [
            "#start",
            "#start",
            "Element: 3",
            "#end",
            "#start",
            "Element: 2",
            "#end",
            "#start",
            "Element: 1",
            "#end",
            "#end",
        ];

        const actual6 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual6, expected6, "#6");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuring(): Promise<void>
    {
        const host = createNode() as HTMLElement & { elements?: [number, number][] };

        host.elements = [[1, 2]];

        const shadowRoot = "<template #for=\"const [index0, index1] of host.elements\"><span>Element[0]: {index0}, Element[1]: {index1}</span></template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.elements = [[1, 2], [2, 4]];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.elements = [[1, 2], [2, 4], [3, 6]];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#start",
            "Element[0]: 3, Element[1]: 6",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");

        host.elements = [[2, 4]];

        await scheduler.execution();

        const expected4 =
        [
            "#start",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#end",
        ];

        const actual4 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual4, expected4, "#4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithArrayDestructuringDeepNested(): Promise<void>
    {
        const host = createNode() as HTMLElement & { elements?: [number, { item: { name: string } }][] };

        host.elements = [[1, { item: { name: "one" } }]];

        const shadowRoot = "<template #for=\"const [index, { item: { name } }] of host.elements\"><span>Element: {index}, Name: {name}</span></template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "Element: 1, Name: one",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }],
        ];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Element: 1, Name: one",
            "#end",
            "#start",
            "Element: 2, Name: two",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.elements =
        [
            [1, { item: { name: "one" } }],
            [2, { item: { name: "two" } }],
            [3, { item: { name: "three" } }],
        ];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Element: 1, Name: one",
            "#end",
            "#start",
            "Element: 2, Name: two",
            "#end",
            "#start",
            "Element: 3, Name: three",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");

        host.elements = [[2, { item: { name: "two" } }]];

        await scheduler.execution();

        const expected4 =
        [
            "#start",
            "#start",
            "Element: 2, Name: two",
            "#end",
            "#end",
        ];

        const actual4 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual4, expected4, "#4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuring(): Promise<void>
    {
        const host = createNode() as HTMLElement & { elements?: { values: [number, number]}[] };

        host.elements = [{ values: [1, 2] }];

        const shadowRoot = "<template #for=\"const { values: [value1, value2] } of host.elements\"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
        ];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.elements =
        [
            { values: [1, 2] },
            { values: [2, 4] },
            { values: [3, 6] },
        ];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#start",
            "Element[0]: 3, Element[1]: 6",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");

        host.elements = [{ values: [2, 4] }];

        await scheduler.execution();

        const expected4 =
        [
            "#start",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#end",
        ];

        const actual4 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual4, expected4, "#4");
    }

    @test @shouldPass
    public async templateWithLoopDirectiveWithObjectDestructuringDeepNested(): Promise<void>
    {
        const host = createNode() as HTMLElement & { elements?: { values: [number, [[number]]]}[] };

        host.elements = [{ values: [1, [[2]]] }];

        const shadowRoot = "<template #for=\"const { values: [value1, [[value2]]] } of host.elements\"><span>Element[0]: {value1}, Element[1]: {value2}</span></template>";

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] },
        ];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.elements =
        [
            { values: [1, [[2]]] },
            { values: [2, [[4]]] },
            { values: [3, [[6]]] },
        ];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Element[0]: 1, Element[1]: 2",
            "#end",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#start",
            "Element[0]: 3, Element[1]: 6",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");

        host.elements = [{ values: [2, [[4]]] }];

        await scheduler.execution();

        const expected4 =
        [
            "#start",
            "#start",
            "Element[0]: 2, Element[1]: 4",
            "#end",
            "#end",
        ];

        const actual4 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual4, expected4, "#4");
    }

    @test @shouldPass
    public async templateWithConditionalAndLoopDirectives(): Promise<void>
    {
        const host = createNode() as HTMLElement & { condition?: boolean, items?: [string, number][] };

        host.condition = false;
        host.items     =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        const shadowRoot =
        [
            "<template #if=\"host.condition\" #for=\"const [key, value] of host.items\">",
            "<span>{key}: {value}</span>",
            "</template>",
            "<template #else>",
            "<span>Empty</span>",
            "</template>",
        ].join("");

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "Empty",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.condition = true;

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "One: 1",
            "#end",
            "#start",
            "Two: 2",
            "#end",
            "#start",
            "Three: 3",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");

        host.condition = false;

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "Empty",
            "#end",
        ];

        const actual3 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual3, expected3, "#3");
    }

    @test @shouldPass
    public async templateWithConditionalAndPlaceholderDirectives(): Promise<void>
    {
        const host       = createNode() as HTMLElement & { condition?: boolean, item?: [string, number] };

        const innerHTML =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `;

        const shadowRoot =
        `
            <template #if="host.condition" #placeholder:items="{ item: host.item }">
                <span>Default</span>
            </template>
        `;

        host.condition = false;
        host.item      = ["One", 1];

        compile({ host, innerHTML, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.condition = true;

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "One: 1",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");
    }

    @test @shouldPass
    public async templateWithLoopAndConditionalDirectives(): Promise<void>
    {
        const host = createNode() as HTMLElement & { condition?: boolean, items?: [string, number][] };

        host.condition = false;
        host.items     =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        const shadowRoot =
        [
            "<template #if=\"host.condition\" #for=\"const [key, value] of host.items\">",
            "<span>{key}: {value}</span>",
            "</template>",
            "<template #else>",
            "<span>Empty</span>",
            "</template>",
        ].join("");

        compile({ host, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "Empty",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.condition = true;

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "One: 1",
            "#end",
            "#start",
            "Two: 2",
            "#end",
            "#start",
            "Three: 3",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");
    }

    @test @shouldPass
    public async templateWithLoopAndPlaceholderDirectives(): Promise<void>
    {
        const host = createNode() as HTMLElement & { condition?: boolean, items?: [string, number][] };

        const innerHTML    =
        `
            <template #inject:items="{ item: [key, value] }">
                <span>{key}: {value}</span>
            </template>
        `.trim();

        const shadowRoot =
        `
            <template #for="const item of host.items" #placeholder:items="{ item }">
                <span>Default</span>
            </template>
        `.trim();

        host.condition = false;
        host.items     = [];

        compile({ host, innerHTML, shadowRoot });

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual1, expected1, "#1");

        host.items =
        [
            ["One",   1],
            ["Two",   2],
            ["Three", 3],
        ];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "One: 1",
            "#end",
            "#start",
            "Two: 2",
            "#end",
            "#start",
            "Three: 3",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        assert.deepEqual(actual2, expected2, "#2");
    }

    @test @shouldPass
    public async disposeTree(): Promise<void>
    {
        const hash = crypto.randomUUID();

        const ROOT_TAG = `x-root-${hash}` as const;
        const HOST_TAG = `x-host-${hash}` as const;

        const rootTemplate =
        [
            `<${HOST_TAG} :lang="host.lang" ::title="host.title" foo="{host.lang}" @click="host.title = 'clicked'">`,
            /**/"<span ...attributes='host' #inject #if='true' #for='i of [1, 2, 3]'>Index is {i}</span>",
            `</${HOST_TAG}>`,
        ].join("");

        defineComponent(HOST_TAG, "<span ...attributes=\"host\"></span><span #placeholder></span>");
        defineComponent(ROOT_TAG, rootTemplate);

        const root = document.createElement(ROOT_TAG) as HTMLElement & IDisposable;

        await scheduler.execution();

        root.dispose();

        await scheduler.execution();

        assert.isOk(true);
    }

    @test @shouldFail
    public evaluationErrorOneWayDataBinding(): void
    {
        const host = createNode();

        const shadowRoot = "<span :title='host.foo()'></span>";

        const message = "Evaluation error in ':title=\"host.foo()\"': host.foo is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      <span :title=\"host.foo()\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public evaluationErrorEventBind(): void
    {
        const host = createNode();

        const shadowRoot = "<span @click=\"host.deep.fn\"></span>";

        const message = semver.gte(process.version, "16.0.0")
            ? "Evaluation error in '@click=\"host.deep.fn\"': Cannot read properties of undefined (reading 'fn')"
            : "Evaluation error in '@click=\"host.deep.fn\"': Cannot read property 'fn' of undefined";

        const stack = "<y-component>\n   #shadow-root\n      <span @click=\"host.deep.fn\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldPass
    public async evaluationErrorCustomDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<span #custom=\"{ value }\"></span>";

        const message = "Evaluation error in '#custom=\"{ value }\"': value is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      <span #custom=\"{ value }\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public evaluationErrorTextNodeInterpolation(): void
    {
        const host = createNode();

        const shadowRoot = "<span><h1>This is a text {host.interpolation()}</h1></span>";

        const message = "Evaluation error in 'This is a text {host.interpolation()}': host.interpolation is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      <span>\n         <h1>\n            This is a text {host.interpolation()}";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorChoiceDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<h1>Title</h1><template #for='index of [1]' #if='host.isOk()'></template>";

        const message = "Evaluation error in '#if=\"host.isOk()\"': host.isOk is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <template #for=\"index of [1]\" #if=\"host.isOk()\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorLoopDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<h1>Title</h1><span #for='index of host.elements()'></span>";

        const message = "Evaluation error in '#for=\"index of host.elements()\"': host.elements is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #for=\"index of host.elements()\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorDestructuredLoopDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<h1>Title</h1><span #for='{ x = host.getValue() } of [{ }]'></span>";

        const message = "Evaluation error in '#for=\"{ x = host.getValue() } of [{ }]\"': host.getValue is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <span #for=\"{ x = host.getValue() } of [{ }]\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorPlaceholderDirective(): Promise<void>
    {
        const host = createNode();

        const innerHTML  = "<template #inject:items=\"{ item: [key, value] }\"></template>";
        const shadowRoot = "<div class=\"foo\"><span></span><template #placeholder:items=\"{ item }\"></template></div>";

        const message = "Evaluation error in '#placeholder:items=\"{ item }\"': item is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      <div class=\"foo\">\n         ...1 other(s) node(s)\n         <template #placeholder:items=\"{ item }\">";

        const actual   = await tryActionAsync(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationPlaceholderKeyDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<h1>Title</h1><template #placeholder.key='key'></template>";

        const message = "Evaluation error in '#placeholder.key=\"key\"': key is not defined";
        const stack   = "<y-component>\n   #shadow-root\n      ...1 other(s) node(s)\n      <template #placeholder.key=\"key\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorInjectDirective(): Promise<void>
    {
        const host = createNode();

        const innerHTML  = "<template #inject:items=\"{ item: value = lastItem }\"></template>";
        const shadowRoot = "<div class=\"foo\"><span></span><template #placeholder:items=\"{ }\"></template></div>";

        const message = "Evaluation error in '#inject:items=\"{ item: value = lastItem }\"': lastItem is not defined";
        const stack   = "<parent-host>\n   #shadow-root\n      <template #inject:items=\"{ item: value = lastItem }\">";

        const actual   = await tryActionAsync(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async evaluationErrorInjectKeyDirective(): Promise<void>
    {
        const host = createNode();

        const innerHTML  = "<template #inject.key='key'></template>";
        const shadowRoot = "<div class=\"foo\"><span></span><template #placeholder></template></div>";

        const message = "Evaluation error in '#inject.key=\"key\"': key is not defined";
        const stack   = "<parent-host>\n   #shadow-root\n      <template #inject.key=\"key\">";

        const actual   = await tryActionAsync(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorOneWayReadonlyProperty(): void
    {
        const host = createNode();

        const shadowRoot = "<span :node-type='host.nodeType'></span>";

        const message = "Binding error in ':node-type=\"host.nodeType\"': Property \"nodeType\" of HTMLSpanElement is readonly";
        const stack   = "<y-component>\n   #shadow-root\n      <span :node-type=\"host.nodeType\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorOneWayReadonlyPropertyInsideTemplate(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<span #if='true' :node-type='host.value'></span>";

        const message = "Binding error in ':node-type=\"host.value\"': Property \"nodeType\" of HTMLSpanElement is readonly";
        const stack   = "<y-component>\n   #shadow-root\n      <span #if=\"true\" :node-type=\"host.value\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorTwoWayReadonlyProperty(): void
    {
        const host = createNode();

        Object.defineProperty(host, "value", { value: "", writable: false });

        const shadowRoot = "<span ::title='host.value'></span>";

        const message = "Binding error in '::title=\"host.value\"': Property \"value\" of YComponent is readonly";
        const stack   = "<y-component>\n   #shadow-root\n      <span ::title=\"host.value\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorTwoWayReadonlyPropertyInsideTemplate(): Promise<void>
    {
        const host = createNode();

        Object.defineProperty(host, "value", { value: "", writable: false });

        const shadowRoot = "<span #for='const letter in host.nodeName' #if='true' ::title='host.value'></span>";

        const message = "Binding error in '::title=\"host.value\"': Property \"value\" of YComponent is readonly";
        const stack   = "<y-component>\n   #shadow-root\n      <span #for=\"const letter in host.nodeName\" #if=\"true\" ::title=\"host.value\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingMissingPropertyErrorOneWayBinding(): void
    {
        const host = createNode();

        const shadowRoot = "<span :title='host.value1'></span>";

        const message = "Binding error in ':title=\"host.value1\"': Property \"value1\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <span :title=\"host.value1\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingMissingPropertyErrorTwoWayBinding(): void
    {
        const host = createNode();

        const shadowRoot = "<span ::title='host.value1'></span>";

        const message = "Binding error in '::title=\"host.value1\"': Property \"value1\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <span ::title=\"host.value1\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorAttributeInterpolation(): void
    {
        const host = createNode();

        const shadowRoot = "<span name='value: {host.value1}'></span>";

        const message = "Binding error in 'name=\"value: {host.value1}\"': Property \"value1\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <span name=\"value: {host.value1}\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorTextNodeInterpolation(): void
    {
        const host = createNode();

        const shadowRoot = "<span>{host.value1}</span>";

        const message = "Binding error in '{host.value1}': Property \"value1\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <span>\n         {host.value1}";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorPlaceholderDirective(): Promise<void>
    {
        const host = createNode();

        const innerHTML  = "<template #inject></template>";
        const shadowRoot = "<template #placeholder:item=\"{ item: host.item }\"></template>";

        const message = "Binding error in '#placeholder:item=\"{ item: host.item }\"': Property \"item\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <template #placeholder:item=\"{ item: host.item }\">";

        const actual   = await tryActionAsync(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorPlaceholderKeyDirective(): void
    {
        const host = createNode();

        const innerHTML  = "<template #inject></template>";
        const shadowRoot = "<template #placeholder.key=\"host.key\"></template>";

        const message = "Binding error in '#placeholder.key=\"host.key\"': Property \"key\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <template #placeholder.key=\"host.key\">";

        const actual   = tryAction(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorInjectDirective(): Promise<void>
    {
        const host = createNode();

        const innerHTML  = "<template #inject=\"{ item = host.item }\"></template>";
        const shadowRoot = "<template #placeholder></template>";

        const message = "Binding error in '#inject=\"{ item = host.item }\"': Property \"item\" does not exists on type HTMLElement";
        const stack   = "<parent-host>\n   #shadow-root\n      <template #inject=\"{ item = host.item }\">";

        const actual   = await tryActionAsync(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async observationErrorInjectKeyDirective(): Promise<void>
    {
        const host = createNode();

        const innerHTML  = "<template #inject.key=\"host.key\"></template>";
        const shadowRoot = "<template #placeholder></template>";

        const message = "Binding error in '#inject.key=\"host.key\"': Property \"key\" does not exists on type HTMLElement";
        const stack   = "<parent-host>\n   #shadow-root\n      <template #inject.key=\"host.key\">";

        const actual   = await tryActionAsync(() => compile({ host, innerHTML, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorChoiceDirective(): void
    {
        const host = createNode();

        const shadowRoot = "<template #if=\"host.key\"></template>";

        const message = "Binding error in '#if=\"host.key\"': Property \"key\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <template #if=\"host.key\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public bindingErrorLoopDirective(): void
    {
        const host = createNode();

        const shadowRoot = "<template #for=\"const keys of host.key\"></template>";

        const message = "Binding error in '#for=\"const keys of host.key\"': Property \"key\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <template #for=\"const keys of host.key\">";

        const actual   = tryAction(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail
    public async bindingErrorCustomDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<span #custom=\"host.key\"></span>";

        const message = "Binding error in '#custom=\"host.key\"': Property \"key\" does not exists on type YComponent";
        const stack   = "<y-component>\n   #shadow-root\n      <span #custom=\"host.key\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @test @shouldFail // TODO: Investigate side effect crashes
    public async spreadTargetIsNotHtmlElement(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<span ...properties=\"{ }\"></span>";

        const message = "Expression '...properties=\"{ }\"' does not result in a valid HTMLElement.";
        const stack   = "<y-component>\n   #shadow-root\n      <span ...properties=\"{ }\">";

        const actual = await tryActionAsync(() => compile({ host, shadowRoot }));

        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }

    @shouldFail @test
    public async unregisteredDirective(): Promise<void>
    {
        const host = createNode();

        const shadowRoot = "<div><div></div><section><span #foo='\"bar\"'></span></section></div>";

        const message = "Unregistered directive #foo.";
        const stack   = "<y-component>\n   #shadow-root\n      <div>\n         ...1 other(s) node(s)\n         <section>\n            <span #foo=\"\"bar\"\">";

        const actual   = await tryActionAsync(() => compile({ host, shadowRoot }));
        const expected = toRaw(new CustomStackError(message, stack));

        assert.deepEqual(actual, expected);
    }
}
