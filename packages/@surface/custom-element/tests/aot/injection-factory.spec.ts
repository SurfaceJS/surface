/* eslint-disable import/no-unassigned-import */
import "../fixtures/dom.js";

import { shouldPass, suite, test }  from "@surface/test-suite";
import chai                         from "chai";
import fragmentFactory              from "../../internal/aot/factories/fragment-factory.js";
import injectionFactory             from "../../internal/aot/factories/injection-factory.js";
import placeholderFactory           from "../../internal/aot/factories/placeholder-factory.js";
import textNodeInterpolationFactory from "../../internal/aot/factories/text-node-interpolation-factory.js";
import type DestructuredEvaluator   from "../../internal/aot/types/destructured-evaluator.js";
import type Evaluator               from "../../internal/aot/types/evaluator.js";
import { scheduler }                from "../../internal/singletons.js";

@suite
export default class InjectionFactorySpec
{
    @test @shouldPass
    public async injection(): Promise<void>
    {
        type Scope = { value: number };

        const host = document.createElement("div");

        host.attachShadow({ mode: "open" });

        const [content, activator] = fragmentFactory
        ([
            placeholderFactory
            (
                () => "default",
                ((scope: Scope) => ({ item: scope.value })) as Evaluator,
                [[], [["value"]]],
                textNodeInterpolationFactory(((scope: Scope) => `Value: ${scope.value}`) as Evaluator, [["value"]]),
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

        const [injectionContent, injectionActivator] = injectionFactory
        (
            () => "default",
            ((scope: Scope) => scope) as DestructuredEvaluator,
            [[], [["value"]]],
            textNodeInterpolationFactory(((scope: Scope) => `Injected: ${scope.value}`) as Evaluator, [["value"]]),
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