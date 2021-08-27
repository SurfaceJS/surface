import Block               from "../block.js";
import PlaceholdeStatement from "../statements/placeholder-statement.js";
import type Activator       from "../types/activator";
import type Expression     from "../types/expression";
import type Factory        from "../types/fatctory";
import type ObservablePath from "../types/observable-path";

export default function placeholderFactory(key: Expression<string>, value: Expression, observables: [key: ObservablePath[], value: ObservablePath[]], factory: Factory): Factory
{
    return () =>
    {
        const block = new Block();

        const activator: Activator = (parent, host, scope, directives) =>
        {
            parent.insertBefore(block.start, block.end);

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

        return [block.end, activator];
    };
}
