/* eslint-disable max-len */
import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import Block                               from "../directives/block.js";
import InjectDirective                     from "../directives/inject-directive.js";
import type Activator                      from "../types/activator.js";
import type DestructuredEvaluator          from "../types/destructured-evaluator.js";
import type Evaluator                      from "../types/evaluator.js";
import type NodeFactory                    from "../types/node-factory.js";

export default function createInjectionFactory(keyEvaluator: Evaluator, valueEvaluator: DestructuredEvaluator, observables: [key: ObservablePath[], value: ObservablePath[]], factory: NodeFactory, source?: { key: string, scope: string }, stackTrace?: StackTrace): NodeFactory
{
    return () =>
    {
        const fragment = document.createDocumentFragment();

        const block = new Block();

        block.connect(fragment);

        const activator: Activator = (parent, host, scope, directives) =>
        {
            const context =
            {
                block,
                directives,
                factory,
                host,
                key:   keyEvaluator,
                observables,
                parent,
                scope,
                source,
                stackTrace,
                value: valueEvaluator,
            };

            return new InjectDirective(context);
        };

        return [fragment, activator];
    };
}
