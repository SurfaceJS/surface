import { Constructor, Func1, Indexer, Nullable } from "@surface/core";
import { typeGuard }                             from "@surface/core/common/generic";
import { injectToConstructor }                   from "@surface/core/common/object";
import { camelToDashed }                         from "@surface/core/common/string";
import Reactive                                  from "@surface/reactive";
import CustomElement                             from ".";
import ICustomElement                            from "./interfaces/custom-element";
import * as symbols                              from "./internal/symbols";
import TemplateProcessor                         from "./internal/template-processor";
import { Metadata, StaticMetadata }              from "./internal/types";

type Target = ICustomElement & { [symbols.METADATA]?: Metadata, constructor: Function & { [symbols.STATIC_METADATA]?: StaticMetadata } };

function clone<T>(source: T, fallback: T): T
{
    return Array.isArray(fallback) ? [...(source as T & Array<unknown> ?? fallback)] as unknown as T : { ...(source ?? fallback) };
}

function getMetadata(target: object & { [symbols.METADATA]?: Metadata }): Metadata
{
    return target[symbols.METADATA] = !target.hasOwnProperty(symbols.METADATA) && !!target[symbols.METADATA]
        ? { ...target[symbols.METADATA] }
        : target[symbols.METADATA] ?? { };
}

function getStaticMetadata(target: Function & { [symbols.STATIC_METADATA]?: StaticMetadata }): StaticMetadata
{
    return target[symbols.STATIC_METADATA] = !target.hasOwnProperty(symbols.STATIC_METADATA) && !!target[symbols.STATIC_METADATA]
        ? { ...target[symbols.STATIC_METADATA] }
        : target[symbols.STATIC_METADATA] ?? { };
}

function getMetadataValue<K extends keyof Metadata>(target: object & { [symbols.STATIC_METADATA]?: StaticMetadata }, key: K, fallback: Metadata[K]): NonNullable<Metadata[K]>
{
    const metadata = getMetadata(target);

    return (metadata[key] = !target.hasOwnProperty(symbols.STATIC_METADATA) && !!target[symbols.STATIC_METADATA]
        ? clone(metadata[key], fallback)
        : metadata[key] ?? fallback) as NonNullable<Metadata[K]>;
}

function getStaticMetadataValue<K extends keyof StaticMetadata>(target: Function & { [symbols.STATIC_METADATA]?: StaticMetadata }, key: K, fallback: StaticMetadata[K]): NonNullable<StaticMetadata[K]>
{
    const metadata = getStaticMetadata(target);

    return (metadata[key] = !target.hasOwnProperty(symbols.STATIC_METADATA) && !!target[symbols.STATIC_METADATA]
        ? clone(metadata[key], fallback)
        : metadata[key] ?? fallback) as NonNullable<StaticMetadata[K]>;
}

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
                    if (!cache || Object.is(this[privateKey as string], undefined))
                    {
                        this[privateKey as string] = fn(this[symbols.SHADOW_ROOT]);
                    }

                    return this[privateKey as string];
                }
            }
        );
    };
}

function stringToCSSStyleSheet(source: string): CSSStyleSheet
{
    const sheet = new CSSStyleSheet() as CSSStyleSheet & { replaceSync: (source: string) => void };

    sheet.replaceSync(source);

    return sheet;
}

export function attribute(converter: Func1<string, unknown>): PropertyDecorator;
export function attribute(target: ICustomElement, propertyKey: string): void;
export function attribute(...args: [Func1<string, unknown>] | [ICustomElement, string, PropertyDescriptor?]): ((target: Target, propertyKey: string) => void)|void
{
    const decorator = (target: Target, propertyKey: string) =>
    {
        const constructor = target.constructor;

        const attributeName = camelToDashed(propertyKey);

        const conversionHandlers = getMetadataValue(target, "conversionHandlers", { });
        const observedAttributes = getStaticMetadataValue(constructor, "observedAttributes", []);

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
            switch (Reflect.getMetadata("design:type", target, propertyKey))
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

        const metadata = getMetadata(target);

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
        return decorator;
    }
    else
    {
        const [target, propertyKey] = args;

        decorator(target, propertyKey);
    }
}

export function computed<T extends object>(...properties: Array<keyof T>): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U & { [symbols.METADATA]?: Metadata }, propertyKey: string) =>
    {
        const action = (instance: HTMLElement) =>
        {
            for (const property of properties)
            {
                Reactive.observe(instance, property as string)[1].subscribe({ notify: () => Reactive.notify(instance, propertyKey)});
            }
        };

        getStaticMetadataValue(target.constructor, "postConstruct", []).push(action);
    };
}

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(target: T) =>
    {
        if (typeGuard<typeof CustomElement>(target, target.prototype instanceof CustomElement))
        {
            const metadata = getStaticMetadata(target);

            const templateElement = document.createElement("template");

            templateElement.innerHTML = template || "<slot></slot>";

            if (style)
            {
                const styles = getStaticMetadataValue(target, "styles", []);

                styles.push(stringToCSSStyleSheet(style));
            }

            metadata.template = templateElement;

            const action = (instance: InstanceType<T> & CustomElement) =>
            {
                TemplateProcessor.process(instance, instance[symbols.SHADOW_ROOT], { host: instance });

                instance.onAfterBind?.();

                metadata.postConstruct?.forEach(x => x(instance));

                return instance;
            };

            const proxy = injectToConstructor(target, action);

            window.customElements.define(name, proxy, options);

            return proxy;
        }

        window.customElements.define(name, target, options);

        return target;
    };
}

export function event<K extends keyof HTMLElementEventMap>(type: K, options?: boolean|AddEventListenerOptions): (target: object, propertyKey: string|symbol) => void
{
    return (target: object, propertyKey: string|symbol) =>
    {
        const action = (element: HTMLElement) =>
        {
            element.addEventListener(type, (event: HTMLElementEventMap[K]) => (element as Indexer<Function>)[propertyKey as string]!.call(element, event), options);
        };

        getStaticMetadataValue(target.constructor, "postConstruct", []).push(action);
    };
}


export function query(selector: string, cache?: boolean): (target: HTMLElement, propertyKey: string|symbol) => void
{
    return queryFactory(x => x.querySelector(selector), cache);
}

export function queryAll(selector: string, cache?: boolean): (target: HTMLElement, propertyKey: string|symbol) => void
{
    return queryFactory(x => x.querySelectorAll(selector), cache);
}

export function styles(...styles: Array<string>): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(constructor: T) =>
    {
        const $styles = getStaticMetadataValue(constructor, "styles", []);

        $styles.push(...styles.map(stringToCSSStyleSheet));

        return constructor;
    };
}