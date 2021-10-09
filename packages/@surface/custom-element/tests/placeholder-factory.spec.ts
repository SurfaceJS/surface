/* eslint-disable import/no-unassigned-import */
import "@surface/dom-shim";

import { shouldPass, suite, test }        from "@surface/test-suite";
import chai                               from "chai";
import createElementFactory               from "../internal/factories/create-element-factory.js";
import createPlaceholderFactory           from "../internal/factories/create-placeholder-factory.js";
import createTextNodeInterpolationFactory from "../internal/factories/create-text-node-interpolation-factory.js";
import { scheduler }                      from "../internal/singletons.js";
import type Activator                     from "../internal/types/activator";
import type Evaluator                     from "../internal/types/evaluator.js";

@suite
export default class PlaceholderFactorySpec
{
    @test @shouldPass
    public async placeholder(): Promise<void>
    {
        type Scope = { value: number };

        const [element, activator] = createElementFactory
        (
            "div",
            undefined,
            undefined,
            [
                createPlaceholderFactory
                (
                    () => "default",
                    ((scope: { value: string }) => ({ item: scope.value })) as Evaluator,
                    [[], [["value"]]],
                    createTextNodeInterpolationFactory(((scope: { value: string }) => `Value: ${scope.value}`) as Evaluator, [["value"]]),
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