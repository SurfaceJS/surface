import type { StackTrace } from "../../types/index.js";
import Block               from "../block.js";
import PlaceholdeStatement from "../statements/placeholder-statement.js";
import type Activator      from "../types/activator";
import type Evaluator      from "../types/evaluator";
import type NodeFactory    from "../types/node-fatctory";
import type ObservablePath from "../types/observable-path";

// eslint-disable-next-line max-len
export default function placeholderFactory(keyEvaluator: Evaluator, valueEvaluator: Evaluator, observables: [key: ObservablePath[], value: ObservablePath[]], factory: NodeFactory, source?: { key: string, value: string }, stackTrace?: StackTrace): NodeFactory
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

            return new PlaceholdeStatement(context);
        };

        return [fragment, activator];
    };
}
