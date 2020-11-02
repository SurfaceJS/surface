import
{
    Constructor,
    Delegate,
    IDisposable,
    Indexer,
    camelToDashed,
    overrideProperty,
} from "@surface/core";
import Reactive, { ISubscription } from "@surface/reactive";
import { createHostScope }         from "./common";
import ICustomElement              from "./interfaces/custom-element";
import Metadata                    from "./metadata/metadata";
import PrototypeMetadata           from "./metadata/prototype-metadata";
import StaticMetadata              from "./metadata/static-metadata";
import { TEMPLATEABLE }            from "./symbols";
import TemplateParser              from "./template-parser";
import TemplateProcessor           from "./template-processor";

const STANDARD_BOOLEANS = ["checked", "disabled", "readonly"];

function queryFactory(fn: (shadowRoot: ShadowRoot) => (Element | null) | NodeListOf<Element>, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return (target: HTMLElement, propertyKey: string | symbol) =>
    {
        const privateKey = typeof propertyKey == "string"
            ? `_${propertyKey.toString()}`
            : Symbol(propertyKey.toString());

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

                    return this[privateKey as string] as unknown;
                },
            },
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

export function attribute(converter: Delegate<[string], unknown>): (target: ICustomElement, propertyKey: string) => void;
export function attribute(target: ICustomElement, propertyKey: string): void;
export function attribute(...args: [Delegate<[string], unknown>] | [ICustomElement, string, PropertyDescriptor?]): ((target: ICustomElement, propertyKey: string) => void) | void
{
    const decorator = (target: ICustomElement, propertyKey: string): PropertyDescriptor =>
    {
        const constructor = target.constructor;

        const attributeName = camelToDashed(propertyKey);

        const prototypeMetadata = PrototypeMetadata.from(target);
        const staticMetadata    = StaticMetadata.from(constructor);

        staticMetadata.observedAttributes.push(attributeName);

        if (!constructor.hasOwnProperty("observedAttributes"))
        {
            function getter(this: Constructor): string[]
            {
                return StaticMetadata.of(this)!.observedAttributes;
            }

            Object.defineProperty(target.constructor, "observedAttributes", { get: getter });
        }

        let converter: Delegate<[string], unknown>;

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

        // eslint-disable-next-line @typescript-eslint/unbound-method
        const attributeChangedCallback = target.attributeChangedCallback;

        if (!attributeChangedCallback || attributeChangedCallback != prototypeMetadata.attributeChangedCallback)
        {
            target.attributeChangedCallback = function(this: HTMLElement, name: string, oldValue: string | undefined, newValue: string, namespace: string | undefined)
            {
                if (!Metadata.from(this).reflectingAttribute)
                {
                    StaticMetadata.from(this.constructor)
                        .conversionHandlers[name]?.(this as object as Indexer, name == newValue && STANDARD_BOOLEANS.includes(name) ? "true" : newValue);

                    attributeChangedCallback?.call(this, name, oldValue, newValue, namespace);
                }
            };

            // eslint-disable-next-line @typescript-eslint/unbound-method
            prototypeMetadata.attributeChangedCallback = target.attributeChangedCallback;
        }

        const action = (instance: HTMLElement, oldValue: unknown, newValue: unknown): void =>
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

    const [target, propertyKey] = args;

    // Reflect.metadata expects that the property decorator returns an descriptor
    return decorator(target, propertyKey) as unknown as void;
}

export function computed<T extends object>(...properties: (keyof T)[]): <U extends T>(target: U, propertyKey: string) => void
{
    return <U extends T>(target: U, propertyKey: string) =>
    {
        const action = (instance: HTMLElement): IDisposable =>
        {
            const subscriptions: ISubscription[] = [];

            for (const property of properties)
            {
                subscriptions.push(Reactive.observe(instance, property as string).observer.subscribe({ notify: () => Reactive.notify(instance, propertyKey) }));
            }

            return { dispose: () => subscriptions.splice(0).forEach(x => x.unsubscribe()) };
        };

        StaticMetadata.from(target.constructor).postConstruct.push(action);
    };
}

export function define(name: string, options?: ElementDefinitionOptions): <TTarget extends Constructor<HTMLElement>>(target: TTarget) => void
{
    return <TTarget extends Constructor<HTMLElement>>(target: TTarget) =>
        window.customElements.define(name, target, options);
}

export function element(tagname: string, template?: string, style?: string, options?: ElementDefinitionOptions): <T extends Constructor<ICustomElement> & { [TEMPLATEABLE]?: boolean }>(target: T) => T
{
    return <T extends Constructor<ICustomElement> & { [TEMPLATEABLE]?: boolean }>(target: T) =>
    {
        if (target[TEMPLATEABLE])
        {
            const staticMetadata = StaticMetadata.from(target);

            const templateElement = document.createElement("template");

            templateElement.innerHTML = template ?? "<slot></slot>";

            const descriptor = TemplateParser.parseReference(tagname, templateElement);

            if (style)
            {
                staticMetadata.styles.push(stringToCSSStyleSheet(style));
            }

            staticMetadata.template = templateElement;

            const handler: ProxyHandler<T> =
            {
                construct: (target, args, newTarget) =>
                {
                    const instance = Reflect.construct(target, args, newTarget) as InstanceType<T>;

                    TemplateProcessor.process({ descriptor, host: instance, root: instance.shadowRoot, scope: createHostScope(instance) });

                    const metadata = Metadata.of(instance)!;

                    staticMetadata.postConstruct?.forEach(x => metadata.disposables.push(x(instance)));

                    return instance;
                },
            };

            const proxy = new Proxy(target, handler);

            window.customElements.define(tagname, proxy, options);

            return proxy;
        }

        window.customElements.define(tagname, target, options);

        return target;
    };
}

export function event<K extends keyof HTMLElementEventMap>(type: K, options?: boolean | AddEventListenerOptions): (target: object, propertyKey: string | symbol) => void
{
    return (target: object, propertyKey: string | symbol) =>
    {
        const action = (element: HTMLElement): IDisposable =>
        {
            const listener = (event: HTMLElementEventMap[K]): unknown => (element as object as Indexer<Function>)[propertyKey as string]!.call(element, event);

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

            const action = (instance: HTMLElement): IDisposable =>
            {
                const notify = (value: unknown): unknown => (instance as object as Record<string, Function>)[propertyKey](value);

                const subscription = Reactive.observe(instance, property as string).observer.subscribe({ notify });

                return { dispose: () => subscription.unsubscribe() };
            };

            StaticMetadata.from(target.constructor).postConstruct.push(action);
        }
    };
}

export function query(selector: string, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return queryFactory(x => x.querySelector(selector), nocache);
}

export function queryAll(selector: string, nocache?: boolean): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return queryFactory(x => x.querySelectorAll(selector), nocache);
}

export function styles(...styles: string[]): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(constructor: T) =>
    {
        StaticMetadata.from(constructor).styles.push(...styles.map(stringToCSSStyleSheet));

        return constructor;
    };
}
