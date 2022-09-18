import type { IDisposable }  from "@surface/core";
import type Activator        from "../types/activator.js";
import type AttributeFactory from "../types/attribute-factory.js";
import type NodeFactory      from "../types/node-factory.js";

type Attributes = [name: string, value: string];

export default function createElementFactory(tag: string, attributes?: Attributes[], attributeFactories?: AttributeFactory[], children?: NodeFactory[]): NodeFactory
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

        if ("dispose" in element)
        {
            disposables.push(element as unknown as IDisposable);
        }

        if (children)
        {
            for (const childFactory of children)
            {
                const [childElement, activator] = childFactory();

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

