import type { Constructor }                     from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";
import { disposeTree, stringToCSSStyleSheet }   from "../common.js";
import CustomElement                            from "../custom-element.js";
import type ICustomElement                      from "../interfaces/custom-element";
import StaticMetadata                           from "../metadata/static-metadata.js";
import TemplateParser                           from "../parsers/template-parser.js";
import TemplateProcessor                        from "../processors/template-processor.js";
import { globalCustomDirectives }               from "../singletons.js";
import type CustomElementDefinitionOptions      from "../types/custom-element-definition-options.js";
import type TemplateProcessorContext            from "../types/template-processor-context.js";

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

            const templateElement = document.createElement("template");

            templateElement.innerHTML = options?.template ?? "<slot></slot>";

            const descriptor = TemplateParser.parseReference(tagname, templateElement);

            if (options?.style)
            {
                const styles = Array.isArray(options.style) ? options.style : [options.style];

                staticMetadata.styles.push(...styles.map(stringToCSSStyleSheet));
            }

            staticMetadata.template = templateElement;
            staticMetadata.descriptor = descriptor;

            const handler: ProxyHandler<T> =
            {
                construct: (target, args, newTarget) =>
                {
                    const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

                    HookableMetadata.from(target).finish(instance);

                    const context: TemplateProcessorContext =
                    {
                        directives:         new Map([...globalCustomDirectives, ...Object.entries(options?.directives ?? { })]),
                        host:               instance,
                        root:               instance.shadowRoot,
                        scope:              { host: instance },
                        templateDescriptor: StaticMetadata.from(target).descriptor,
                    };

                    const disposable = TemplateProcessor.process(context);

                    DisposableMetadata.from(instance).add(disposable);
                    DisposableMetadata.from(instance).add({ dispose: () => disposeTree(instance.shadowRoot) });

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
