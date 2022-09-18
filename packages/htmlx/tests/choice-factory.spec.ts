/* eslint-disable import/no-unassigned-import */
import "@surface/dom-shim";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import createChoiceFactory         from "../internal/factories/create-choice-factory.js";
import createElementFactory        from "../internal/factories/create-element-factory.js";
import createFragmentFactory       from "../internal/factories/create-fragment-factory.js";
import { scheduler }               from "../internal/singletons.js";
import type Activator              from "../internal/types/activator.js";
import type Evaluator              from "../internal/types/evaluator.js";

@suite
export default class ChoiceFactorySpec
{
    @test @shouldPass
    public async braches(): Promise<void>
    {
        type Scope = { id: number };

        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            undefined,
            [
                createChoiceFactory
                ([
                    [
                        ((scope: Scope) => scope.id == 1) as Evaluator,
                        [["id"]],
                        createFragmentFactory
                        ([
                            createElementFactory("span", [["name", "IF"]]),
                        ]),
                    ],
                    [
                        ((scope: Scope) => scope.id == 2) as Evaluator,
                        [["id"]],
                        createFragmentFactory
                        ([
                            createElementFactory("span", [["name", "ELSE IF"]]),
                        ]),
                    ],
                    [
                        () => true,
                        [],
                        createFragmentFactory
                        ([
                            createElementFactory("span", [["name", "ELSE"]]),
                        ]),
                    ],
                ]),
            ],
        )() as [Element, Activator];

        const scope: Scope = { id: 1 };

        const expected =
        [
            "#start",
            "#end",
        ];

        const disposable = activator(document.body, element, scope, new Map());

        const actual = Array.from(element.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual, expected, "#0");

        await scheduler.execution();

        chai.assert.equal(element.firstElementChild!.nodeName, "SPAN");
        chai.assert.equal(element.firstElementChild!.getAttribute("name"), "IF");

        scope.id = 2;

        await scheduler.execution();

        chai.assert.equal(element.firstElementChild!.nodeName, "SPAN");
        chai.assert.equal(element.firstElementChild!.getAttribute("name"), "ELSE IF");

        scope.id = 3;

        await scheduler.execution();

        chai.assert.equal(element.firstElementChild!.nodeName, "SPAN");
        chai.assert.equal(element.firstElementChild!.getAttribute("name"), "ELSE");

        disposable.dispose();

        chai.assert.equal(element.firstElementChild, null);
    }
}