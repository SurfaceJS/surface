/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable sort-keys */
/* eslint-disable import/no-unassigned-import */
import "../fixtures/dom.js";

import { shouldPass, suite, test } from "@surface/test-suite";
import chai                        from "chai";
import elementFactory              from "../../internal/aot/factories/element-factory.js";
import fragmentFactory             from "../../internal/aot/factories/fragment-factory.js";
import loopFactory                 from "../../internal/aot/factories/loop-factory.js";
import textNodeFactory             from "../../internal/aot/factories/text-node-factory.js";
import type Activator               from "../../internal/aot/types/activator";
import { scheduler }               from "../../internal/singletons.js";

@suite
export default class LoopFactorySpec
{
    @test @shouldPass
    public async forIn(): Promise<void>
    {
        type Scope = { items: number[] };

        const [element, activator] = elementFactory
        (
            "div",
            undefined,
            undefined,
            undefined,
            undefined,
            [
                loopFactory
                (
                    (_: Scope, value: unknown) => ({ item: value }),
                    "in",
                    (scope: Scope) => scope.items,
                    [["items"]],
                    fragmentFactory
                    ([
                        textNodeFactory((scope: any) => `Index: ${scope.item}`, [["item"]]),
                    ]),
                ),
            ],
        )() as [Element, Activator];

        const scope: Scope = { items: [1] };

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
            "#start",
            "Index: 0",
            "#end",
            "#end",
        ];

        const actual1 = Array.from(element.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual1, expected1, "#1");

        scope.items = [1, 2, 3];

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "#start",
            "Index: 0",
            "#end",
            "#start",
            "Index: 1",
            "#end",
            "#start",
            "Index: 2",
            "#end",
            "#end",
        ];

        const actual2 = Array.from(element.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual2, expected2, "#2");

        scope.items = [1, 2];

        await scheduler.execution();

        const expected3 =
        [
            "#start",
            "#start",
            "Index: 0",
            "#end",
            "#start",
            "Index: 1",
            "#end",
            "#end",
        ];

        const actual3 = Array.from(element.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual3, expected3, "#3");

        disposable.dispose();

        chai.assert.equal(element.firstElementChild, null);
    }
}