import type { ObservablePath, StackTrace } from "@surface/htmlx-parser";
import Block                               from "../directives/block.js";
import PlaceholdeDirective                 from "../directives/placeholder-directive.js";
import type Activator                      from "../types/activator";
import type Evaluator                      from "../types/evaluator";
import type NodeFactory                    from "../types/node-factory";

// eslint-disable-next-line max-len
export default function createPlaceholderFactory(keyEvaluator: Evaluator, valueEvaluator: Evaluator, observables: [key: ObservablePath[], scope: ObservablePath[]], factory: NodeFactory, source?: { key: string, scope: string }, stackTrace?: StackTrace): NodeFactory
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

            return new PlaceholdeDirective(context);
        };

        return [fragment, activator];
    };
}
