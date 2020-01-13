import { Constructor, Func1, Indexer, Nullable } from "@surface/core";
import { typeGuard }                             from "@surface/core/common/generic";
import { camelToDashed }                         from "@surface/core/common/string";
import Reactive                                  from "@surface/reactive";
import Type                                      from "@surface/reflection";
import CustomElement                             from ".";
import ICustomElement                            from "./interfaces/custom-element";
import * as symbols                              from "./internal/symbols";
import TemplateProcessor                         from "./internal/template-processor";
import { Metadata, StaticMetadata }              from "./internal/types";

type Target = ICustomElement & { [symbols.METADATA]?: Metadata, constructor: Function & { [symbols.STATIC_METADATA]?: StaticMetadata } };

function queryFactory(fn: (shadowRoot: ShadowRoot) => (Element | null) | NodeListOf<Element>, cache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return (target: HTMLElement, propertyKey: string|symbol) =>
    {
        const privateKey = typeof propertyKey == "string" ? `_${propertyKey.toString()}` : Symbol(propertyKey.toString());

        Object.defineProperty
        (
            target,
            propertyKey,
            {
                get(this: HTMLElement & { [symbols.SHADOW_ROOT]: ShadowRoot } & Indexer<(Element | null) | NodeListOf<Element>>)
                {
                    if (!cache || !this[privateKey as string])
                    {
                        this[privateKey as string] = fn(this[symbols.SHADOW_ROOT]);
                    }

                    return this[privateKey as string];
                }
            }
        );
    };
}

export function attribute(converter: Func1<string, unknown>): PropertyDecorator;
export function attribute(target: ICustomElement, propertyKey: string): void;
export function attribute(...args: [Func1<string, unknown>] | [ICustomElement, string, PropertyDescriptor?]): PropertyDecorator | void
{

    const decorator = (target: Target, propertyKey: string) =>
    {
        const constructor = target.constructor;

        const attributeName = camelToDashed(propertyKey);

        const hasInheritance       = !target.hasOwnProperty(symbols.METADATA) && !!target[symbols.METADATA];
        const hasStaticInheritance = !constructor.hasOwnProperty(symbols.STATIC_METADATA) && !!constructor[symbols.STATIC_METADATA];

        const metadata = target[symbols.METADATA] = hasInheritance
            ? { ...target[symbols.METADATA] }
            : target[symbols.METADATA] ?? { };

        const staticMetadata = constructor[symbols.STATIC_METADATA] = hasInheritance
            ? { ...constructor[symbols.STATIC_METADATA] }
            : constructor[symbols.STATIC_METADATA] ?? { };

        const conversionHandlers = metadata.conversionHandlers = hasInheritance
            ? { ...metadata.conversionHandlers }
            : metadata.conversionHandlers ?? { };

        const observedAttributes = staticMetadata.observedAttributes = hasStaticInheritance
            ? [ ...(staticMetadata.observedAttributes ?? [])]
            : staticMetadata.observedAttributes ?? [];

        observedAttributes.push(attributeName);

        if (!constructor.hasOwnProperty("observedAttributes"))
        {
            Object.defineProperty(target.constructor, "observedAttributes", { get: () => observedAttributes });
        }

        let converter: Func1<string, unknown>;

        if (args.length == 1)
        {
            converter = args[0];
        }
        else
        {
            const type = Type.from(target);

            switch (type.getField(propertyKey)?.metadata["design:type"])
            {
                case Boolean:
                    converter = x => x === "" || x == "true";
                    break;
                case Number:
                    converter = x => Number.parseFloat(x) || 0;
                    break;
                default:
                    converter = x => x;
            }
        }

        conversionHandlers[attributeName] = (target: Indexer, value: string) =>
        {
            const current   = target[propertyKey];
            const converted = converter(value);

            if (!Object.is(current, converted))
            {
                target[propertyKey] = converted;
            }
        };

        const attributeChangedCallback = target.attributeChangedCallback;

        if (!attributeChangedCallback || attributeChangedCallback != metadata.attributeChangedCallback)
        {
            target.attributeChangedCallback = function(this: HTMLElement & { [symbols.METADATA]?: Metadata }, name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>)
            {
                this[symbols.METADATA]?.conversionHandlers?.[name]?.(this as Indexer, newValue);

                attributeChangedCallback?.call(this, name, oldValue, newValue, namespace);
            };

            metadata.attributeChangedCallback = target.attributeChangedCallback;
        }
    };

    if (args.length == 1)
    {
        return decorator as Function as PropertyDecorator; // Waiting type definition fix;
    }
    else
    {
        const [target, propertyKey] = args;

        decorator(target, propertyKey);
    }
}

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(target: T & { [symbols.STATIC_METADATA]?: StaticMetadata }) =>
    {
        if (typeGuard<Function, typeof CustomElement>(target, x => x.prototype instanceof CustomElement))
        {
            const hasStaticInheritance = !target.hasOwnProperty(symbols.METADATA) && !!target[symbols.STATIC_METADATA];

            const metadata = target[symbols.STATIC_METADATA] = hasStaticInheritance
                ? { ...target[symbols.STATIC_METADATA] }
                : target[symbols.STATIC_METADATA] ?? { };

            const templateElement = document.createElement("template");

            templateElement.innerHTML = template || "<slot></slot>";

            if (metadata.styles)
            {
                style = [...metadata.styles, style].join("\n");
            }

            if (style)
            {
                const styleElement = document.createElement("style");

                styleElement.innerHTML = style;

                templateElement.content.prepend(styleElement);
            }

            metadata.template = templateElement;

            const proxy = function(this: CustomElement, ...args: Array<unknown>)
            {
                const instance = Reflect.construct(target, args, new.target) as CustomElement;

                TemplateProcessor.process(instance, instance[symbols.SHADOW_ROOT], { host: instance });

                if (instance.onAfterBind)
                {
                    instance.onAfterBind();
                }

                return instance;
            };

            Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
            Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(target));

            proxy.prototype.constructor = proxy;

            window.customElements.define(name, proxy, options);

            return proxy as Function as T;
        }

        window.customElements.define(name, target, options);

        return target;
    };
}

export function notify<T extends object>(property: keyof T): <U extends T>(target: U, propertyKey: keyof U) => void
{
    return <U extends T>(target: U, propertyKey: keyof U) =>
    {
        const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

        if (descriptor?.set)
        {
            Object.defineProperty
            (
                target,
                propertyKey,
                {
                    configurable: true,
                    get: descriptor?.get,
                    set(this: object, value: unknown)
                    {
                        descriptor.set!.call(this, value);

                        Reactive.getReactor(this)?.notify(this as T, property);
                    }
                }
            );
        }
        else if (!descriptor || descriptor.writable)
        {
            const privateKey = typeof propertyKey == "string" ? `_${propertyKey.toString()}` : Symbol(propertyKey.toString());

            Object.defineProperty
            (
                target,
                propertyKey,
                {
                    configurable: true,
                    get(this: Indexer)
                    {
                        return this[privateKey as string];
                    },
                    set(this: Indexer, value: unknown)
                    {
                        this[privateKey as string] = value;

                        Reactive.getReactor(this)?.notify(this as T, property);
                    }
                }
            );
        }
    };
}

export const query = (selector: string, cache?: boolean) => queryFactory(x => x.querySelector(selector), cache);

export const queryAll = (selector: string, cache?: boolean) => queryFactory(x => x.querySelectorAll(selector), cache);

export function styles(...styles: Array<string>): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(target: T & { [symbols.STATIC_METADATA]?: StaticMetadata }) =>
    {
        const hasStaticInheritance = !target.hasOwnProperty(symbols.METADATA) && !!target[symbols.STATIC_METADATA];

        const metadata = target[symbols.STATIC_METADATA] = hasStaticInheritance
            ? { ...target[symbols.STATIC_METADATA] }
            : target[symbols.STATIC_METADATA] ?? { };

        const $styles = metadata.styles = hasStaticInheritance
            ? [ ...(metadata.styles ?? [])]
            : metadata.styles ?? [];

        $styles.push(...styles);

        return target;
    };
}