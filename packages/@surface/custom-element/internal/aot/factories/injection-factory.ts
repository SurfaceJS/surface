/* eslint-disable max-len */
import type { StackTrace }        from "../../types/index.js";
import Block                      from "../block.js";
import InjectStatement            from "../statements/inject-statement.js";
import type Activator             from "../types/activator";
import type DestructuredEvaluator from "../types/destructured-evaluator.js";
import type Evaluator             from "../types/evaluator.js";
import type NodeFactory           from "../types/node-fatctory";
import type ObservablePath        from "../types/observable-path";

export default function injectionFactory(keyEvaluator: Evaluator, valueEvaluator: DestructuredEvaluator, observables: [key: ObservablePath[], value: ObservablePath[]], factory: NodeFactory, source?: { key: string, value: string }, stackTrace?: StackTrace): NodeFactory
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

            return new InjectStatement(context);
        };

        return [fragment, activator];
    };
}
