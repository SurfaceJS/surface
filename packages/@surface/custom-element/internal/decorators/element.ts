import type { Constructor }                     from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";
import { stringToCSSStyleSheet }                from "../common.js";
import CustomElement                            from "../custom-element.js";
import type ICustomElement                      from "../interfaces/custom-element.js";
import Metadata                                 from "../metadata/metadata.js";
import StaticMetadata                           from "../metadata/static-metadata.js";
import TemplateCompiler                         from "../processors/template-compiler.js";
import { globalCustomDirectives }               from "../singletons.js";
import type CustomElementDefinitionOptions      from "../types/custom-element-definition-options.js";

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

            const factory = typeof options?.template == "function" ? options.template : TemplateCompiler.compile(tagname, options?.template ?? "<slot></slot>");

            if (options?.style)
            {
                const styles = Array.isArray(options.style) ? options.style : [options.style];

                staticMetadata.styles.push(...styles.map(stringToCSSStyleSheet));
            }

            staticMetadata.directives = options?.directives ? new Map([...globalCustomDirectives, ...Object.entries(options.directives)]) : globalCustomDirectives;
            staticMetadata.factory    = factory;

            const handler: ProxyHandler<T> =
            {
                construct: (target, args, newTarget) =>
                {
                    const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

                    HookableMetadata.from(target).finish(instance);

                    const scope = { host: instance };

                    const disposable = Metadata.from(instance).activator!(instance.shadowRoot!, instance, scope, staticMetadata.directives);

                    DisposableMetadata.from(instance).add(disposable);
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
