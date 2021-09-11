/* eslint-disable import/no-unassigned-import */
import "./fixtures/dom.js";

import { shouldPass, suite, test }  from "@surface/test-suite";
import chai                         from "chai";
import elementFactory               from "../internal/factories/element-factory.js";
import fragmentFactory              from "../internal/factories/fragment-factory.js";
import loopFactory                  from "../internal/factories/loop-factory.js";
import textNodeInterpolationFactory from "../internal/factories/text-node-interpolation-factory.js";
import { scheduler }                from "../internal/singletons.js";
import type Activator               from "../internal/types/activator";
import type DestructuredEvaluator   from "../internal/types/destructured-evaluator.js";
import type Evaluator               from "../internal/types/evaluator.js";

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
            [
                loopFactory
                (
                    ((_: Scope, value: unknown) => ({ item: value })) as DestructuredEvaluator,
                    "in",
                    ((scope: Scope) => scope.items) as Evaluator,
                    [["items"]],
                    fragmentFactory
                    ([
                        textNodeInterpolationFactory(((scope: { item: string }) => `Index: ${scope.item}`) as Evaluator, [["item"]]),
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