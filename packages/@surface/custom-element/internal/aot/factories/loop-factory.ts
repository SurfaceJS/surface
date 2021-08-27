import Block               from "../block.js";
import LoopStatement       from "../statements/loop-statement.js";
import type Activator      from "../types/activator";
import type Expression     from "../types/expression";
import type Factory        from "../types/fatctory";
import type ObservablePath from "../types/observable-path";
import type Pattern        from "../types/pattern.js";

export default function loopFactory(left: Pattern, operator: "in" | "of", right: Expression, observables: ObservablePath[], factory: Factory): Factory
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
                left,
                observables,
                operator,
                parent,
                right,
                scope,
            };

            return new LoopStatement(context);
        };

        return [block.end, activator];
    };
}
