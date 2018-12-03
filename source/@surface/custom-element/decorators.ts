import { Func1, Indexer, Nullable }     from "@surface/core";
import { structuralEqual }              from "@surface/core/common/object";
import { camelToDashed, dashedToCamel } from "@surface/core/common/string";
import CustomElement                    from ".";
import ElementBind                      from "./internal/element-bind";
import * as symbols                     from "./internal/symbols";

type AttributeChangedCallback = (name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>) => void;
type Observable               = { [symbols.OBSERVED_ATTRIBUTES]?: Array<string|symbol>; };

function isCustomElement(source: Function): source is typeof CustomElement
{
    return source.prototype instanceof CustomElement;
}

function isHTMLElement(source: Function): source is typeof HTMLElement
{
    return source.prototype instanceof HTMLElement;
}

export function attribute<T>(converter: Func1<string, T>): PropertyDecorator;
export function attribute<T extends object>(target: object, propertyKey: string|symbol): void;
export function attribute(...args: [Func1<string, unknown>]|[object, string|symbol]): PropertyDecorator|void
{
    const decorator = (target: object, propertyKey: string|symbol) =>
    {
        if (target instanceof HTMLElement && typeof propertyKey == "string")
        {
            const constructor = target.constructor as Observable;

            if (!constructor[symbols.OBSERVED_ATTRIBUTES])
            {
                const values: Array<string> = [];
                Object.defineProperty(target.constructor, symbols.OBSERVED_ATTRIBUTES, { get: () => values } );
                Object.defineProperty(target.constructor, "observedAttributes", { get: () => constructor[symbols.OBSERVED_ATTRIBUTES] });
            }

            const attributeName = camelToDashed(propertyKey);

            constructor[symbols.OBSERVED_ATTRIBUTES]!.push(attributeName);

            const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey)!;

            if (descriptor.get && descriptor.set)
            {
                const getter = descriptor.get;
                const setter = descriptor.set;

                descriptor.set = function(this: HTMLElement, value: unknown)
                {
                    if (getter.call(this) == value)
                    {
                        setter.call(this, value);

                        this.setAttribute(attributeName, `${value}`);
                    }
                };

                const attributeChangedCallback = (target as Indexer)["attributeChangedCallback"] as Nullable<AttributeChangedCallback>;

                (target as Indexer)["attributeChangedCallback"] = function(this: HTMLElement, name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>)
                {
                    const property = dashedToCamel(name);

                    const converter = args.length == 1 ? args[0] : (x: unknown) => x;
                    const value     = getter.call(this);

                    if (!structuralEqual(value, converter(newValue)))
                    {
                        (this as Indexer)[property] = newValue;
                    }

                    if (attributeChangedCallback)
                    {
                        attributeChangedCallback.call(this, name, oldValue, newValue, namespace);
                    }
                };
            }
        }
        else
        {
            throw new TypeError("Target is not an valid instance of HTMLElement");
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

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecorator
{
    return <T extends Function>(target: T) =>
    {
        if (isHTMLElement(target))
        {
            if (isCustomElement(target))
            {
                const templateElement = document.createElement("template");

                templateElement.innerHTML = template || "<slot></slot>";

                if (style)
                {
                    const styleElement = document.createElement("style");
                    styleElement.innerHTML = style;
                    templateElement.content.appendChild(styleElement);
                }

                if (window.ShadyCSS)
                {
                    window.ShadyCSS.prepareTemplate(templateElement, name, options && options.extends);
                }

                Object.defineProperty(target, symbols.TEMPLATE, { get: () => templateElement } );

                const proxy = function(this: CustomElement, ...args: Array<unknown>)
                {
                    const instance = Reflect.construct(target, args, new.target) as CustomElement;

                    ElementBind.for({ host: instance }, instance[symbols.SHADOW_ROOT]);

                    if (instance.bindedCallback)
                    {
                        instance.bindedCallback();
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
        }
        else
        {
            throw new TypeError("Target is not an valid subclass of HTMLElement");
        }
    };
}