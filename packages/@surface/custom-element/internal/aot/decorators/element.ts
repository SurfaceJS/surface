import type { Constructor }                from "@surface/core";
import { HookableMetadata }                from "@surface/core";
import type { ICustomElement }             from "../../../index.js";
import CustomElement                       from "../../../index.js";
import { stringToCSSStyleSheet }           from "../../common.js";
import StaticMetadata                      from "../../metadata/static-metadata.js";
import type CustomElementDefinitionOptions from "../../types/custom-element-definition-options.js";
import TemplateCompiler                    from "../template-compiler.js";

/**
 * Defines a new custom element.
 * @param tagname tag name to be registered.
 * @param options definition options.
 */
export default function element(tagname: `${string}-${string}`, options?: CustomElementDefinitionOptions): <T extends Constructor<ICustomElement>>(target: T) => T
{
    return <T extends Constructor<ICustomElement>>(target: T) =>
    {
        if (target.prototype instanceof CustomElement)
        {
            const staticMetadata = StaticMetadata.from(target);

            const factory = TemplateCompiler.compile(tagname, options?.template ?? "<slot></slot>");

            if (options?.style)
            {
                const styles = Array.isArray(options.style) ? options.style : [options.style];

                staticMetadata.styles.push(...styles.map(stringToCSSStyleSheet));
            }

            staticMetadata.factory = factory;

            const handler: ProxyHandler<T> =
            {
                construct: (target, args, newTarget) =>
                {
                    const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

                    HookableMetadata.from(target).finish(instance);

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
