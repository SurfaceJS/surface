import Block                      from "../block.js";
import InjectStatement            from "../statements/inject-statement.js";
import type Activator             from "../types/activator";
import type DestructuredEvaluator from "../types/destructured-evaluator.js";
import type Evaluator             from "../types/evaluator.js";
import type NodeFactory           from "../types/node-fatctory";
import type ObservablePath        from "../types/observable-path";

export default function injectionFactory(key: Evaluator<string>, value: DestructuredEvaluator, observables: [key: ObservablePath[], value: ObservablePath[]], factory: NodeFactory): NodeFactory
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
                key,
                observables,
                parent,
                scope,
                value,
            };

            return new InjectStatement(context);
        };

        return [fragment, activator];
    };
}
