/* eslint-disable sort-keys */
import Block                from "../directives/block.js";
import ChoiceStatement      from "../directives/choice-directive.js";
import type Activator       from "../types/activator";
import type ChoiceBranch from "../types/choice-branch";
import type NodeFactory     from "../types/node-fatctory.js";

export default function choiceFactory(branches: ChoiceBranch[]): NodeFactory
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
