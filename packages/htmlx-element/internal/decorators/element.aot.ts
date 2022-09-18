import type { Constructor }                     from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";
import { stringToCSSStyleSheet }                from "../common.js";
import HTMLXElement                             from "../htmlx-element.js";
import type IHTMLXElement                       from "../interfaces/htmlx-element.js";
import Metadata                                 from "../metadata/metadata.js";
import StaticMetadata                           from "../metadata/static-metadata.js";
import { directivesRegistry }                   from "../singletons.js";
import type HTMLXElementDefinitionOptions       from "../types/htmlx-element-definition-options.js";

/**
 * Defines a new custom element.
 * @param tagname tag name to be registered.
 * @param options definition options.
 */
export default function element(tagname: `${string}-${string}`, options?: HTMLXElementDefinitionOptions): <T extends Constructor<IHTMLXElement>>(target: T) => T
{
    return <T extends Constructor<IHTMLXElement>>(target: T) =>
    {
        if (target.prototype instanceof HTMLXElement)
        {
            const staticMetadata = StaticMetadata.from(target);

            if (typeof options?.template == "string")
            {
                throw new Error("String templates not supported when using AOT.");
            }

            if (options?.style)
            {
                const styles = Array.isArray(options.style) ? options.style : [options.style];

                staticMetadata.styles.push(...styles.map(stringToCSSStyleSheet));
            }

            const directives = options?.directives ? new Map([...directivesRegistry, ...Object.entries(options.directives)]) : directivesRegistry;

            staticMetadata.template = options?.template;

            const handler: ProxyHandler<T> =
            {
                construct: (target, args, newTarget) =>
                {
                    const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

                    HookableMetadata.from(target).finish(instance);

                    const scope = { host: instance };

                    const activator = Metadata.from(instance).activator;

                    if (activator)
                    {
                        const disposable = activator(instance.shadowRoot!, instance, scope, directives);

                        DisposableMetadata.from(instance).add(disposable);
                    }

                    DisposableMetadata.from(instance).add(DisposableMetadata.from(scope));

                    return instance;
                },
            };

            HookableMetadata.from(target).hooked = true;

            const proxy = new Proxy(target, handler);

            window.customElements.define(tagname, proxy, options);

            return proxy;
        }

        window.customElements.define(tagname, target, options);

        return target;
    };
}
