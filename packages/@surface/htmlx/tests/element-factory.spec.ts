// eslint-disable-next-line import/no-unassigned-import
import "@surface/dom-shim";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import createDirectiveFactory      from "../internal/factories/create-directive-factory.js";
import createElementFactory        from "../internal/factories/create-element-factory.js";
import createEventFactory          from "../internal/factories/create-event-factory.js";
import createInterpolationFactory  from "../internal/factories/create-interpolation-factory.js";
import createOnewayFactory         from "../internal/factories/create-oneway-factory.js";
import createTwowayFactory         from "../internal/factories/create-twoway-factory.js";
import { scheduler }               from "../internal/singletons.js";
import type Activator              from "../internal/types/activator";
import type Evaluator              from "../internal/types/evaluator.js";
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
        const [element] = createElementFactory("div")();

        chai.assert.equal(element.nodeName, "DIV");
        chai.assert.instanceOf(element, HTMLElement);
    }

    @test @shouldPass
    public attributes(): void
    {
        const [element] = createElementFactory("div", [["foo", ""], ["bar", "bar"]])() as [Element, Activator];

        chai.assert.isTrue(element.hasAttribute("foo"));
        chai.assert.equal(element.getAttribute("bar"), "bar");
    }

    @test @shouldPass
    public async interpolation(): Promise<void>
    {
        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            [createInterpolationFactory("value", ((scope: { host: { value: unknown } }) => scope.host.value) as Evaluator, [["host", "value"]])],
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
        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            [createOnewayFactory("className", ((scope: { host: { value: unknown } }) => scope.host.value) as Evaluator, [["host", "value"]])],
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
        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            [createTwowayFactory("className", ["host", "value"])],
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
        type Scope = { host: { click: Function } };

        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            [createEventFactory("click", ((scope: Scope) => scope.host.click) as Evaluator, ((scope: Scope) => scope.host.click) as Evaluator)],
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

        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            [
                createDirectiveFactory("custom", ((scope: Scope) => scope.host.value) as Evaluator, [["host", "value"]]),
                createDirectiveFactory("custom-factory", ((scope: Scope) => scope.host.value) as Evaluator, [["host", "value"]]),
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
        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            undefined,
            [
                createElementFactory
                (
                    "span",
                    undefined,
                    [createInterpolationFactory("value", ((scope: { host: { value: unknown } }) => scope.host.value) as Evaluator, [["host", "value"]])],
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