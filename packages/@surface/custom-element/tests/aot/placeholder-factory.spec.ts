/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-keys */
/* eslint-disable import/no-unassigned-import */
import "../fixtures/dom.js";

import { shouldPass, suite, test }  from "@surface/test-suite";
import chai                         from "chai";
import elementFactory               from "../../internal/aot/factories/element-factory.js";
import placeholderFactory           from "../../internal/aot/factories/placeholder-factory.js";
import textNodeFactory              from "../../internal/aot/factories/text-node-factory.js";
import type Activator               from "../../internal/aot/types/activator";
import { scheduler }                from "../../internal/singletons.js";

@suite
export default class PlaceholderFactorySpec
{
    @test @shouldPass
    public async placeholder(): Promise<void>
    {
        type Scope = { value: number };

        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            undefined,
            undefined,
            undefined,
            [
                placeholderFactory
                (
                    () => "default",
                    scope => ({ item: scope.value }),
                    [[], [["value"]]],
                    textNodeFactory(scope => `Value: ${scope.value}`, [["value"]]),
                ),
            ],
        )() as [Element, Activator];

        const scope: Scope = { value: 42 };

        const disposable = activator(document.body, element, scope, new Map());

        const expected =
        [
            "#start",
            "#end",
        ];

        const actual = Array.from(element.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual, expected, "#0");

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "Value: 42",
            "#end",
        ];

        const actual1 = Array.from(element.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual1, expected1, "#1");

        disposable.dispose();

        chai.assert.equal(element.firstElementChild, null);
    }
}