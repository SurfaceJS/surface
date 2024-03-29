/* eslint-disable sort-keys */
import Block             from "../directives/block.js";
import ChoiceDirective   from "../directives/choice-directive.js";
import type Activator    from "../types/activator.js";
import type ChoiceBranch from "../types/choice-branch.js";
import type NodeFactory  from "../types/node-factory.js";

export default function createChoiceFactory(branches: ChoiceBranch[]): NodeFactory
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

            return new ChoiceDirective(context);
        };

        return [fragment, activate];
    };
}
