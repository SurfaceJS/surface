import type { IDisposable }  from "@surface/core";
import type Activator        from "../types/activator";
import type AttributeFactory from "../types/attribute-factory.js";
import type NodeFactory      from "../types/node-factory";

type Attributes = [name: string, value: string];

export default function createElementFactory(tag: string, attributes?: Attributes[], attributeFactories?: AttributeFactory[], childs?: NodeFactory[]): NodeFactory
{
    return () =>
    {
        const element = document.createElement(tag);

        if (attributes)
        {
            for (const attribute of attributes)
            {
                element.setAttribute(attribute[0], attribute[1]);
            }
        }

        const activators:  Activator[]   = [];
        const disposables: IDisposable[] = [];

        if (childs)
        {
            for (const childFactory of childs)
            {
                const [childElement, activator] = childFactory();

                if ("dispose" in childElement)
                {
                    disposables.push(childElement as unknown as IDisposable);
                }

                element.appendChild(childElement);

                activators.push(activator);
            }
        }

        const activator: Activator = (_parent, host, scope, directives) =>
        {
            for (const activator of activators)
            {
                disposables.push(activator(element, host, scope, directives));
            }

            if (attributeFactories)
            {
                for (const factory of attributeFactories)
                {
                    disposables.push(factory(element, scope, directives));
                }
            }

            element.dispatchEvent(new Event("bind"));

            return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
        };

        return [element, activator];
    };
}

