import Block               from "../block.js";
import InjectStatement     from "../statements/inject-statement.js";
import type Activator      from "../types/activator";
import type Expression     from "../types/expression.js";
import type Factory        from "../types/fatctory";
import type ObservablePath from "../types/observable-path";
import type Pattern        from "../types/pattern.js";

export default function injectionFactory(key: Expression<string>, value: Pattern, observables: [key: ObservablePath[], value: ObservablePath[]], factory: Factory): Factory
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

            return new InjectStatement(context);
        };

        return [block.end, activator];
    };
}
