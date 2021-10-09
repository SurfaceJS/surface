import type { IDisposable } from "@surface/core";
import type Activator       from "../types/activator";
import type NodeFactory     from "../types/node-factory";

export default function createFragmentFactory(factories: NodeFactory[]): NodeFactory
{
    return () =>
    {
        const fragment = document.createDocumentFragment();
        const activators: Activator[] = [];

        for (const factory of factories)
        {
            const [element, activator] = factory();

            fragment.appendChild(element);

            activators.push(activator);
        }

        const activator: Activator = (parent, host, scope, directives) =>
        {
            const disposables: IDisposable[] = [];

            for (const activator of activators)
            {
                disposables.push(activator(parent, host, scope, directives));
            }

            return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
        };

        return [fragment, activator];
    };
}

