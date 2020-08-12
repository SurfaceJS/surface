import Component          from "./types/component";
import RouteConfiguration from "./types/route-configuration";
import IRouteDefinition   from "./types/route-definition";

const pattern = /(.+)\/.+$/;

export default class RouteConfigurator
{
    private static resolveComponents(config: RouteConfiguration): Map<string, Component | (() => Component)>
    {
        return "component" in config
            ? new Map([["default", config.component]])
            : new Map(Object.entries(config.components));
    }

    public static *configure(configurations: Iterable<RouteConfiguration>, parent?: IRouteDefinition): Iterable<IRouteDefinition>
    {
        for (const config of configurations)
        {
            let hasDefaultChildren = false;

            const path = !parent || config.path.startsWith("/")
                ? config.path
                : config.path
                    ? `${parent.path}/${config.path}`
                    : parent.path;

            const components = RouteConfigurator.resolveComponents(config);

            if (components.size == 0)
            {
                throw new Error(`Route "${config.path}" requires at least one component`);
            }

            const definition: IRouteDefinition =
            {
                meta:  config.meta ?? { },
                name:  config.name,
                path,
                stack: [...parent?.stack ?? [], components],
            };

            if ((config.children?.length ?? 0) > 0)
            {
                for (const child of RouteConfigurator.configure(config.children!, definition))
                {
                    if (child.path == definition.path)
                    {
                        hasDefaultChildren = true;
                    }

                    yield child;
                }
            }

            if (hasDefaultChildren)
            {
                definition.path = definition.path.replace(pattern, "$1");
            }

            yield definition;
        }
    }
}