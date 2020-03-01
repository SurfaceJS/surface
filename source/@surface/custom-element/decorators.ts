import { Constructor, Func1, Indexer, Nullable } from "@surface/core";
import { typeGuard }                             from "@surface/core/common/generic";
import { injectToConstructor, overrideProperty } from "@surface/core/common/object";
import { camelToDashed }                         from "@surface/core/common/string";
import Reactive                                  from "@surface/reactive";
import CustomElement                             from ".";
import ICustomElement                            from "./interfaces/custom-element";
import Metadata                                  from "./internal/metadata";
import StaticMetadata                            from "./internal/static-metadata";
import * as symbols                              from "./internal/symbols";
import TemplateProcessor                         from "./internal/template-processor";

const STANDARD_BOOLEANS = ["checked", "disabled", "readonly"];

type WithMetadata<T extends object|Function> = T extends Function
    ? T & { [symbols.STATIC_METADATA]?: StaticMetadata }
    : T & { [symbols.METADATA]?: Metadata, constructor: Function & { [symbols.STATIC_METADATA]?: StaticMetadata } };

type Target = ICustomElement & { [symbols.METADATA]?: Metadata, constructor: Function & { [symbols.STATIC_METADATA]?: StaticMetadata } };

function queryFactory(fn: (shadowRoot: ShadowRoot) => (Element | null) | NodeListOf<Element>, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return (target: HTMLElement, propertyKey: string|symbol) =>
    {
        const privateKey = typeof propertyKey == "string" ? `_${propertyKey.toString()}` : Symbol(propertyKey.toString());

        Object.defineProperty
        (
            target,
            propertyKey,
            {
                configurable: true,
                get(this: HTMLElement & { [symbols.SHADOW_ROOT]: ShadowRoot } & Indexer<(Element | null) | NodeListOf<Element>>)
                {
                    if (!!nocache || Object.is(this[privateKey as string], undefined))
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
    sheet.toString = () => source;

    return sheet;
}

export function attribute(converter: Func1<string, unknown>): (target: Target, propertyKey: string) => void;
export function attribute(target: ICustomElement, propertyKey: string): void;
export function attribute(...args: [Func1<string, unknown>] | [ICustomElement, string, PropertyDescriptor?]): ((target: Target, propertyKey: string) => void)|void
{
    const decorator = (target: Target, propertyKey: string) =>
    {
        const constructor = target.constructor;

        const attributeName = camelToDashed(propertyKey);

        const metadata       = Metadata.from(target);
        const staticMetadata = StaticMetadata.from(constructor);

        staticMetadata.observedAttributes.push(attributeName);

        if (!constructor.hasOwnProperty("observedAttributes"))
        {
            const getter = function(this: Constructor & { [symbols.STATIC_METADATA]: StaticMetadata })
            {
                return this[symbols.STATIC_METADATA].observedAttributes;
            };

            Object.defineProperty(target.constructor, "observedAttributes", { get: getter });
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

        staticMetadata.conversionHandlers[attributeName] = (target: Indexer, value: string) =>
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
            target.attributeChangedCallback = function(this: WithMetadata<HTMLElement>, name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>)
            {
                if (!this[symbols.METADATA]!.reflectingAttribute)
                {
                    this.constructor[symbols.STATIC_METADATA]!
                        .conversionHandlers[name]?.(this as Indexer, name == newValue && STANDARD_BOOLEANS.includes(name) ? "true" : newValue);

                    attributeChangedCallback?.call(this, name, oldValue, newValue, namespace);
                }
            };

            metadata.attributeChangedCallback = target.attributeChangedCallback;
        }

        const action = (instance: WithMetadata<HTMLElement>, oldValue: unknown, newValue: unknown) =>
        {
            if (!Object.is(oldValue, undefined))
            {
                const metadata = instance[symbols.METADATA];

                metadata!.reflectingAttribute = true;

                instance.setAttribute(attributeName, `${newValue}`);

                metadata!.reflectingAttribute = false;
            }
        };

        return overrideProperty(target as WithMetadata<HTMLElement>, propertyKey, action, null, true);
    };

    if (args.length == 1)
    {
        return decorator;
    }
    else
    {
        const [target, propertyKey] = args;

         // Reflect.metadata expects that the property decorator returns an descriptor
        return decorator(target, propertyKey) as unknown as void;
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

        StaticMetadata.from(target.constructor).postConstruct.push(action);
    };
}

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(target: T) =>
    {
        if (typeGuard<typeof CustomElement>(target, target.prototype instanceof CustomElement))
        {
            const staticMetadata = StaticMetadata.from(target);

            const templateElement = document.createElement("template");

            // templateElement.innerHTML = template ?? "<slot></slot>";
            templateElement.innerHTML = `<style>${[...staticMetadata.styles.map(x => x.toString()), style].join("\n")}</style>${template ?? "<slot></slot>"}`;

            if (style)
            {
                staticMetadata.styles.push(stringToCSSStyleSheet(style));
            }

            staticMetadata.template = templateElement;

            const action = (instance: InstanceType<T> & CustomElement) =>
            {
                TemplateProcessor.process(instance, instance[symbols.SHADOW_ROOT], { host: instance });

                instance.onAfterBind?.();

                staticMetadata.postConstruct?.forEach(x => x(instance));

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

        StaticMetadata.from(target.constructor).postConstruct.push(action);
    };
}

export function observe<T extends object>(property: keyof T): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        if (typeof target[propertyKey as keyof U] == "function")
        {

            const action = (instance: HTMLElement) =>
                Reactive.observe(instance, property as string)[1]
                    .subscribe({ notify: x => (instance as object as Record<string, Function>)[propertyKey](x) });

            StaticMetadata.from(target.constructor).postConstruct.push(action);
        }
    };
}

export function query(selector: string, nocache?: boolean): (target: HTMLElement, propertyKey: string|symbol) => void
{
    return queryFactory(x => x.querySelector(selector), nocache);
}

export function queryAll(selector: string, nocache?: boolean): (target: HTMLElement, propertyKey: string|symbol) => void
{
    return queryFactory(x => x.querySelectorAll(selector), nocache);
}

export function styles(...styles: Array<string>): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(constructor: T) =>
    {
        StaticMetadata.from(constructor).styles.push(...styles.map(stringToCSSStyleSheet));

        return constructor;
    };
}