/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-keys */
/* eslint-disable import/no-unassigned-import */
import "../fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import { scheduler }               from "../../index.js";
import elementFactory              from "../../internal/aot/factories/element-factory.js";
import type Activator              from "../../internal/aot/types/activator";

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
            [["interpolation", "value", (scope: any) => scope.host.value, [["host", "value"]]]],
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
            [["oneway", "className", (scope: any) => scope.host.value, [["host", "value"]]]],
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
            [["twoway", "className", (scope: any) => scope.host, [["host", "value"]]]],
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
            undefined,
            [["click", (scope: any) => scope.host.click.bind(scope.host)]],
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
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            undefined,
            undefined,
            [[() => "click", (scope: any) => ({ value: scope.host.value }), [[["click"]], [["host", "value"]]]]],
        )() as [Element, Activator];

        const scope = { host: { value: "Hello World" } };

        const disposable = activator(document.body, element, scope, new Map());

        disposable.dispose();

        chai.assert.isTrue(false);
    }

    @test @shouldPass
    public async childs(): Promise<void>
    {
        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            undefined,
            undefined,
            undefined,
            [
                elementFactory
                (
                    "span",
                    undefined,
                    [["interpolation", "value", (scope: any) => scope.host.value, [["host", "value"]]]],
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