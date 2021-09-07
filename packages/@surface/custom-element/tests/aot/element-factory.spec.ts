// eslint-disable-next-line import/no-unassigned-import
import "../fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import { scheduler }               from "../../index.js";
import directiveFactory            from "../../internal/aot/factories/directive-factory.js";
import elementFactory              from "../../internal/aot/factories/element-factory.js";
import eventFactory                from "../../internal/aot/factories/event-factory.js";
import interpolationFactory        from "../../internal/aot/factories/interpolation-factory.js";
import onewayFactory               from "../../internal/aot/factories/oneway-factory.js";
import twowayFactory               from "../../internal/aot/factories/twoway-factory.js";
import type Activator              from "../../internal/aot/types/activator";
import type Evaluator              from "../../internal/aot/types/evaluator.js";
import customDirectiveFactory      from "./fixtures/custom-directive-factory.js";
import CustomDirective             from "./fixtures/custom-directive.js";

const globalCustomDirectives = new Map();

globalCustomDirectives.set("custom", CustomDirective);
globalCustomDirectives.set("custom-factory", customDirectiveFactory);

@suite
export default class ElementFactorySpec
{
    @test @shouldPass
    public tag(): void
    {
        const [element] = elementFactory("div")();

        chai.assert.equal(element.nodeName, "DIV");
        chai.assert.instanceOf(element, HTMLElement);
    }

    @test @shouldPass
    public attributes(): void
    {
        const [element] = elementFactory("div", [["foo", ""], ["bar", "bar"]])() as [Element, Activator];

        chai.assert.isTrue(element.hasAttribute("foo"));
        chai.assert.equal(element.getAttribute("bar"), "bar");
    }

    @test @shouldPass
    public async interpolation(): Promise<void>
    {
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            [interpolationFactory("value", ((scope: { host: { value: unknown } }) => scope.host.value) as Evaluator, [["host", "value"]])],
        )() as [Element, Activator];

        const scope = { host: { value: "Hello World" } };

        const disposable = activator(document.body, element, scope, new Map());

        await scheduler.execution();

        chai.assert.equal(element.getAttribute("value"), scope.host.value);

        scope.host.value = "Hello World!!!";

        await scheduler.execution();

        chai.assert.equal(element.getAttribute("value"), scope.host.value);

        disposable.dispose();

        scope.host.value = "Bye Bye World!!!";

        await scheduler.execution();

        chai.assert.notEqual(element.getAttribute("value"), scope.host.value);
    }

    @test @shouldPass
    public async oneWay(): Promise<void>
    {
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            [onewayFactory("className", ((scope: { host: { value: unknown } }) => scope.host.value) as Evaluator, [["host", "value"]])],
        )() as [Element, Activator];

        const scope = { host: { value: "my-class" } };

        const disposable = activator(document.body, element, scope, new Map());

        await scheduler.execution();

        chai.assert.equal(element.className, scope.host.value);

        scope.host.value = "my-class-changed";

        await scheduler.execution();

        chai.assert.equal(element.className, scope.host.value);

        disposable.dispose();

        scope.host.value = "my-class-not-changed";

        await scheduler.execution();

        chai.assert.notEqual(element.className, scope.host.value);
    }

    @test @shouldPass
    public async twoWay(): Promise<void>
    {
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            [twowayFactory("className", ["host", "value"])],
        )() as [Element, Activator];

        const scope = { host: { value: "my-class" } };

        const disposable = activator(document.body, element, scope, new Map());

        await scheduler.execution();

        chai.assert.equal(element.className, scope.host.value);

        scope.host.value = "my-class-changed";

        await scheduler.execution();

        chai.assert.equal(element.className, scope.host.value);

        element.className = "my-class-changed-again";

        await scheduler.execution();

        chai.assert.equal(element.className, scope.host.value);

        disposable.dispose();

        element.className = "my-class-not-changed";

        await scheduler.execution();

        chai.assert.notEqual(element.className, scope.host.value);
    }

    @test @shouldPass
    public events(): void
    {
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            [eventFactory("click", ((scope: { host: { click: Function } }) => scope.host.click.bind(scope.host)) as Evaluator)],
        )() as [Element, Activator];

        let clicked = 0;

        const scope = { host: { click: () => clicked++ } };

        const disposable = activator(document.body, element, scope, new Map());

        element.dispatchEvent(new Event("click"));

        chai.assert.equal(clicked, 1);

        disposable.dispose();

        element.dispatchEvent(new Event("click"));

        chai.assert.equal(clicked, 1);
    }

    @test @shouldPass
    public directives(): void
    {
        type Scope = { host: { value: string } };

        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            [
                directiveFactory("custom", ((scope: Scope) => scope.host.value) as Evaluator, [["host", "value"]]),
                directiveFactory("custom-factory", ((scope: Scope) => scope.host.value) as Evaluator, [["host", "value"]]),
            ],
        )() as [Element, Activator];

        const scope: Scope = { host: { value: "Hello World!!!" } };

        const disposable = activator(document.body, element, scope, globalCustomDirectives);

        chai.assert.equal(element.childNodes[0].textContent, "custom: Hello World!!!");
        chai.assert.equal(element.childNodes[1].textContent, "custom-factory: Hello World!!!");

        disposable.dispose();
    }

    @test @shouldPass
    public async childs(): Promise<void>
    {
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            undefined,
            [
                elementFactory
                (
                    "span",
                    undefined,
                    [interpolationFactory("value", ((scope: { host: { value: unknown } }) => scope.host.value) as Evaluator, [["host", "value"]])],
                ),
            ],
        )() as [Element, Activator];

        const scope = { host: { value: "Hello World" } };

        activator(document.body, element, scope, new Map());

        await scheduler.execution();

        chai.assert.equal(element.firstElementChild!.nodeName, "SPAN");
        chai.assert.equal(element.firstElementChild!.getAttribute("value"), scope.host.value);
    }
}