/* eslint-disable sort-keys */
import Block                from "../block.js";
import ChoiceStatement      from "../statements/choice-statement.js";
import type Activator        from "../types/activator";
import type BranchStatement from "../types/branch-statement";
import type Factory         from "../types/fatctory.js";

export default function choiceFactory(branches: BranchStatement[]): Factory
{
    return () =>
    {
        const block = new Block();

        const activate: Activator = (parent, host, scope, directives) =>
        {
            parent.insertBefore(block.start, block.end);

            const context =
            {
                parent,
                host,
                scope,
                block,
                branches,
                directives,
            };

            return new ChoiceStatement(context);
        };

        return [block.end, activate];
    };
}
