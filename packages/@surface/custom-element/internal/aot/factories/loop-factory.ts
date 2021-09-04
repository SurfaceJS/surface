import Block                      from "../block.js";
import LoopStatement              from "../statements/loop-statement.js";
import type Activator             from "../types/activator";
import type DestructuredEvaluator from "../types/destructured-evaluator.js";
import type Evaluator             from "../types/evaluator";
import type NodeFactory           from "../types/node-fatctory";
import type ObservablePath        from "../types/observable-path";

export default function loopFactory(left: DestructuredEvaluator, operator: "in" | "of", right: Evaluator, observables: ObservablePath[], factory: NodeFactory): NodeFactory
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
                left,
                observables,
                operator,
                parent,
                right,
                scope,
            };

            return new LoopStatement(context);
        };

        return [fragment, activator];
    };
}
