import Block               from "../block.js";
import PlaceholdeStatement from "../statements/placeholder-statement.js";
import type Activator       from "../types/activator";
import type Evaluator     from "../types/evaluator";
import type NodeFactory        from "../types/node-fatctory";
import type ObservablePath from "../types/observable-path";

export default function placeholderFactory(key: Evaluator<string>, value: Evaluator, observables: [key: ObservablePath[], value: ObservablePath[]], factory: NodeFactory): NodeFactory
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

            return new PlaceholdeStatement(context);
        };

        return [fragment, activator];
    };
}
