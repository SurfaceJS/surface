/* eslint-disable sort-keys */
import Block                from "../block.js";
import ChoiceStatement      from "../statements/choice-statement.js";
import type Activator        from "../types/activator";
import type BranchStatement from "../types/branch-statement";
import type NodeFactory         from "../types/node-fatctory.js";

export default function choiceFactory(branches: BranchStatement[]): NodeFactory
{
    return () =>
    {
        const fragment = document.createDocumentFragment();

        const block = new Block();

        block.connect(fragment);

        const activate: Activator = (parent, host, scope, directives) =>
        {
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

        return [fragment, activate];
    };
}
