import type { Constructor, Delegate, Indexer }    from "@surface/core";
import { DisposableMetadata, HookableMetadata }   from "@surface/core";
import { createHostScope, stringToCSSStyleSheet } from "../common.js";
import CustomElement                              from "../custom-element.js";
import type ICustomElement                        from "../interfaces/custom-element";
import Metadata                                   from "../metadata/metadata.js";
import PrototypeMetadata                          from "../metadata/prototype-metadata.js";
import StaticMetadata                             from "../metadata/static-metadata.js";
import TemplateParser                             from "../parsers/template-parser.js";
import TemplateProcessor                          from "../processors/template-processor.js";
import { globalCustomDirectives }                 from "../singletons.js";
import type { DirectiveEntry }                    from "../types/index.js";
import type TemplateProcessorContext              from "../types/template-processor-context.js";

type CustomElementDefinitionOptions = ElementDefinitionOptions & { directives?: Record<string, DirectiveEntry> };

const STANDARD_BOOLEANS = new Set(["checked", "disabled", "readonly"]);

function wraperPrototype(prototype: ICustomElement): void
{
    const attributeChangedCallback = (callback?: ICustomElement["attributeChangedCallback"]): ICustomElement["attributeChangedCallback"] => function (this: ICustomElement, name, oldValue, newValue, namespace)
    {
        if (!Metadata.from(this).reflectingAttribute.has(name))
        {
            StaticMetadata.from(this.constructor)
                .converters[name]?.(this as object as Indexer, name == newValue && STANDARD_BOOLEANS.has(name) ? "true" : newValue);

            callback?.call(this, name, oldValue, newValue, namespace);
        }
    };

    wraperLifecycle(prototype, "attributeChangedCallback", attributeChangedCallback);
}

function wraperLifecycle<K extends keyof ICustomElement>(prototype: ICustomElement, key: K, action: Delegate<[ICustomElement[K]], ICustomElement[K]>): void
{
    const metadata = PrototypeMetadata.from(prototype) as unknown as Indexer;

    const callback = prototype[key];

    if (!callback || callback != metadata[key])
    {
        prototype[key] = action(callback);

        metadata[key] = prototype[key];
    }
}

export default function element(tagname: `${string}-${string}`, template?: string, style?: string, options?: CustomElementDefinitionOptions): <T extends Constructor<ICustomElement>>(target: T) => T
{
    return <T extends Constructor<ICustomElement>>(target: T) =>
    {
        if (target.prototype instanceof CustomElement)
        {
            wraperPrototype(target.prototype);

            const staticMetadata = StaticMetadata.from(target);

            const templateElement = document.createElement("template");

            templateElement.innerHTML = template ?? "<slot></slot>";

            const descriptor = TemplateParser.parseReference(tagname, templateElement);

            if (style)
            {
                staticMetadata.styles.push(stringToCSSStyleSheet(style));
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
                        customDirectives:   new Map([...globalCustomDirectives, ...Object.entries(options?.directives ?? { })]),
                        host:               instance,
                        root:               instance.shadowRoot,
                        scope:              createHostScope(instance),
                        templateDescriptor: StaticMetadata.from(target).descriptor,
                    };

                    const disposable = TemplateProcessor.process(context);

                    DisposableMetadata.from(instance).add(disposable);

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
