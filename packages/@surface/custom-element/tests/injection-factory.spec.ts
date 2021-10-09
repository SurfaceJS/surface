/* eslint-disable import/no-unassigned-import */
import "@surface/dom-shim";

import { shouldPass, suite, test }        from "@surface/test-suite";
import chai                               from "chai";
import createFragmentFactory              from "../internal/factories/create-fragment-factory.js";
import createInjectionFactory             from "../internal/factories/create-injection-factory.js";
import createPlaceholderFactory           from "../internal/factories/create-placeholder-factory.js";
import createTextNodeInterpolationFactory from "../internal/factories/create-text-node-interpolation-factory.js";
import { scheduler }                      from "../internal/singletons.js";
import type DestructuredEvaluator         from "../internal/types/destructured-evaluator.js";
import type Evaluator                     from "../internal/types/evaluator.js";

@suite
export default class InjectionFactorySpec
{
    @test @shouldPass
    public async injection(): Promise<void>
    {
        type Scope = { value: number };

        const host = document.createElement("div");

        host.attachShadow({ mode: "open" });

        const [content, activator] = createFragmentFactory
        ([
            createPlaceholderFactory
            (
                () => "default",
                ((scope: Scope) => ({ item: scope.value })) as Evaluator,
                [[], [["value"]]],
                createTextNodeInterpolationFactory(((scope: Scope) => `Value: ${scope.value}`) as Evaluator, [["value"]]),
            ),
        ])();

        const scope:          Scope = { value: 42 };
        const injectionScope: Scope = { value: 24 };

        host.shadowRoot!.appendChild(content);

        const disposable = activator(host.shadowRoot!, host, scope, new Map());

        const expected =
        [
            "#start",
            "#end",
        ];

        const actual = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual, expected, "#0");

        await scheduler.execution();

        const expected1 =
        [
            "#start",
            "Value: 42",
            "#end",
        ];

        const actual1 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual1, expected1, "#1");

        const [injectionContent, injectionActivator] = createInjectionFactory
        (
            () => "default",
            ((scope: Scope) => scope) as DestructuredEvaluator,
            [[], [["value"]]],
            createTextNodeInterpolationFactory(((scope: Scope) => `Injected: ${scope.value}`) as Evaluator, [["value"]]),
        )();

        host.appendChild(injectionContent);

        const injectionDisposable = injectionActivator(host, document.body, injectionScope, new Map());

        await scheduler.execution();

        const expected2 =
        [
            "#start",
            "Injected: 42",
            "#end",
        ];

        const actual2 = Array.from(host.shadowRoot!.childNodes).map(x => x.textContent);

        chai.assert.deepEqual(actual2, expected2, "#2");

        injectionDisposable.dispose();
        disposable.dispose();

        chai.assert.equal(host.shadowRoot!.firstElementChild, null);
    }
}