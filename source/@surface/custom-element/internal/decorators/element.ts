/* eslint-disable import/prefer-default-export */
import
{
    Constructor,
    Delegate,
    DisposableMetadata,
    HookableMetadata,
    Indexer,
} from "@surface/core";
import { createHostScope, stringToCSSStyleSheet } from "../common";
import CustomElement from "../custom-element";
import ICustomElement                             from "../interfaces/custom-element";
import Metadata                                   from "../metadata/metadata";
import PrototypeMetadata                          from "../metadata/prototype-metadata";
import StaticMetadata                             from "../metadata/static-metadata";
import TemplateParser                             from "../parsers/template-parser";
import TemplateProcessor                          from "../processors/template-processor";
import { scheduler }                              from "../singletons";

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

    const connectedCallback = (callback?: ICustomElement["connectedCallback"]): ICustomElement["connectedCallback"] => function (this: ICustomElement)
    {
        const action = (): void =>
        {
            const root = this.getRootNode();

            if (root instanceof ShadowRoot)
            {
                const metadata = Metadata.from(this);

                if (root.host != metadata.host)
                {
                    metadata.host = root.host;

                    DisposableMetadata.from(root.host).add(this);
                }
            }
        };

        void scheduler.enqueue(action, "high");

        callback?.call(this);
    };

    const disconnectedCallback = (callback?: ICustomElement["disconnectedCallback"]): ICustomElement["disconnectedCallback"] => function (this: ICustomElement)
    {
        const host = Metadata.from(this).host;

        if (host)
        {
            DisposableMetadata.from(host).remove(this);
        }

        callback?.call(this);
    };

    wraperLifecycle(prototype, "attributeChangedCallback", attributeChangedCallback);
    wraperLifecycle(prototype, "connectedCallback", connectedCallback);
    wraperLifecycle(prototype, "disconnectedCallback", disconnectedCallback);
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

export default function element(tagname: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<ICustomElement>>(target: T) => T
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

                    const disposable = TemplateProcessor.process({ descriptor: StaticMetadata.from(target).descriptor, host: instance, root: instance.shadowRoot, scope: createHostScope(instance) });

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
