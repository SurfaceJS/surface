/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-keys */
/* eslint-disable import/no-unassigned-import */
import "../fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import choiceFactory               from "../../internal/aot/factories/choice-factory.js";
import elementFactory              from "../../internal/aot/factories/element-factory.js";
import fragmentFactory             from "../../internal/aot/factories/fragment-factory.js";
import type Activator               from "../../internal/aot/types/activator";
import { scheduler }               from "../../internal/singletons.js";

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
                        (scope: Scope) => scope.id == 1,
                        [["id"]],
                        fragmentFactory
                        ([
                            elementFactory("span", [["name", "IF"]]),
                        ]),
                    ],
                    [
                        (scope: Scope) => scope.id == 2,
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