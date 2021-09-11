/* eslint-disable import/no-unassigned-import */
import "./fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import choiceFactory               from "../internal/factories/choice-factory.js";
import elementFactory              from "../internal/factories/element-factory.js";
import fragmentFactory             from "../internal/factories/fragment-factory.js";
import { scheduler }               from "../internal/singletons.js";
import type Activator              from "../internal/types/activator";
import type Evaluator              from "../internal/types/evaluator.js";

@suite
export default class ChoiceFactorySpec
{
    @test @shouldPass
    public async braches(): Promise<void>
    {
        type Scope = { id: number };

        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            undefined,
            [
                choiceFactory
                ([
                    [
                        ((scope: Scope) => scope.id == 1) as Evaluator,
                        [["id"]],
                        fragmentFactory
                        ([
                            elementFactory("span", [["name", "IF"]]),
                        ]),
                    ],
                    [
                        ((scope: Scope) => scope.id == 2) as Evaluator,
                        [["id"]],
                        fragmentFactory
                        ([
                            elementFactory("span", [["name", "ELSE IF"]]),
                        ]),
                    ],
                    [
                        () => true,
                        [],
                        fragmentFactory
                        ([
                            elementFactory("span", [["name", "ELSE"]]),
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