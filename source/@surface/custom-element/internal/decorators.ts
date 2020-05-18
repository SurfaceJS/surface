import
{
    camelToDashed,
    overrideConstructor,
    overrideProperty,
    Constructor,
    Func1,
    Indexer,
    Nullable
} from "@surface/core";
import Reactive, { ISubscription } from "@surface/reactive";
import ICustomElement              from "./interfaces/custom-element";
import Metadata                    from "./metadata/metadata";
import PrototypeMetadata           from "./metadata/prototype-metadata";
import StaticMetadata              from "./metadata/static-metadata";
import * as symbols                from "./symbols";
import TemplateParser              from "./template-parser";
import TemplateProcessor           from "./template-processor";

const STANDARD_BOOLEANS = ["checked", "disabled", "readonly"];

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
                get(this: HTMLElement & Indexer<(Element | null) | NodeListOf<Element>>)
                {
                    if (!this.shadowRoot)
                    {
                        throw Error("Can't query a closed shadow root");
                    }

                    if (!!nocache || Object.is(this[privateKey as string], undefined))
                    {
                        this[privateKey as string] = fn(this.shadowRoot);
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

        const prototypeMetadata = PrototypeMetadata.from(target);
        const staticMetadata    = StaticMetadata.from(constructor);

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


        if (!attributeChangedCallback || attributeChangedCallback != prototypeMetadata.attributeChangedCallback)
        {
            target.attributeChangedCallback = function(this: HTMLElement, name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>)
            {
                if (!Metadata.from(this).reflectingAttribute)
                {
                    StaticMetadata.from(this.constructor)
                        .conversionHandlers[name]?.(this as unknown as Indexer, name == newValue && STANDARD_BOOLEANS.includes(name) ? "true" : newValue);

                    attributeChangedCallback?.call(this, name, oldValue, newValue, namespace);
                }
            };

            prototypeMetadata.attributeChangedCallback = target.attributeChangedCallback;
        }

        const action = (instance: HTMLElement, oldValue: unknown, newValue: unknown) =>
        {
            if (!Object.is(oldValue, undefined))
            {
                const metadata = Metadata.from(instance);

                metadata.reflectingAttribute = true;

                instance.setAttribute(attributeName, `${newValue}`);

                metadata.reflectingAttribute = false;
            }
        };

        return overrideProperty(target as HTMLElement, propertyKey, action, null, true);
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
            const subscriptions: Array<ISubscription> = [];

            for (const property of properties)
            {
                subscriptions.push(Reactive.observe(instance, property as string).observer.subscribe({ notify: () => Reactive.notify(instance, propertyKey)}));
            }

            return { dispose: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
        };

        StaticMetadata.from(target.constructor).postConstruct.push(action);
    };
}

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<ICustomElement>>(target: T) => T
{
    return <T extends Constructor<ICustomElement>>(target: T) =>
    {
        const staticMetadata = StaticMetadata.from(target);

        const templateElement = document.createElement("template");

        // templateElement.innerHTML = template ?? "<slot></slot>";
        templateElement.innerHTML = `<style>${[...staticMetadata.styles.map(x => x.toString()), style].join("\n")}</style>${template ?? "<slot></slot>"}`;

        const descriptor = TemplateParser.parseReference(name, templateElement);

        if (style)
        {
            staticMetadata.styles.push(stringToCSSStyleSheet(style));
        }

        staticMetadata.template = templateElement;

        const action = (instance: InstanceType<T> & ICustomElement) =>
        {
            TemplateProcessor.process({ scope: { host: instance }, host: instance, root: instance.shadowRoot, descriptor });

            instance.bindedCallback?.();

            const metadata = Metadata.from(instance);

            staticMetadata.postConstruct?.forEach(x => metadata.disposables.push(x(instance)));

            return instance;
        };

        const proxy = overrideConstructor(target, action);

        window.customElements.define(name, proxy, options);

        return proxy;
    };
}

export function event<K extends keyof HTMLElementEventMap>(type: K, options?: boolean|AddEventListenerOptions): (target: object, propertyKey: string|symbol) => void
{
    return (target: object, propertyKey: string|symbol) =>
    {
        const action = (element: HTMLElement) =>
        {
            const listener = (event: HTMLElementEventMap[K]) => (element as unknown as Indexer<Function>)[propertyKey as string]!.call(element, event);

            element.addEventListener(type, listener, options);

            return { dispose: () => element.removeEventListener(type, listener) };
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
            {
                const notify = (value: unknown) => (instance as object as Record<string, Function>)[propertyKey](value);

                const subscription = Reactive.observe(instance, property as string).observer.subscribe({ notify });

                return { dispose: () => subscription.unsubscribe() };
            };

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