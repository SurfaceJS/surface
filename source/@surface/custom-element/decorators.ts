import { Func1, Func2, Indexer, Nullable } from "@surface/core";
import { typeGuard }                       from "@surface/core/common/generic";
import { structuralEqual }                 from "@surface/core/common/object";
import { camelToDashed }                   from "@surface/core/common/string";
import Type                                from "@surface/reflection";
import CustomElement                       from ".";
import { LifeCycle }                       from "./interfaces/types";
import * as symbols                        from "./internal/symbols";
import TemplateProcessor                   from "./internal/template-processor";

type ProxyFuncion          = Function & { [symbols.PROXY_FUNCION]?: boolean };
type AttributteConvertable =
{
    [symbols.CONVERTERS]?:           Record<string, Func2<Indexer, string, unknown>>;
    [symbols.OBSERVED_ATTRIBUTES]?:  Array<string|symbol>;
    [symbols.REFLECTED_ATTRIBUTES]?: Array<string>;
};

export function attribute<T>(converter: Func1<string, T>): PropertyDecorator;
export function attribute<T extends object>(target: object, propertyKey: string|symbol, descriptor: PropertyDescriptor): void;
export function attribute(...args: [Func1<string, unknown>]|[object, string|symbol, PropertyDescriptor]): PropertyDecorator|void
{
    const decorator = (target: object, propertyKey: string|symbol, descriptor: PropertyDescriptor) =>
    {
        if (typeGuard<object, LifeCycle<HTMLElement> & AttributteConvertable & Indexer>(target, x => x instanceof HTMLElement) && typeof propertyKey == "string")
        {
            const attributeName = camelToDashed(propertyKey);

            const observedAttributes = target[symbols.OBSERVED_ATTRIBUTES] = target.hasOwnProperty(symbols.OBSERVED_ATTRIBUTES) ?
                target[symbols.OBSERVED_ATTRIBUTES]!
                : !!target[symbols.OBSERVED_ATTRIBUTES] ?
                    [...(target[symbols.OBSERVED_ATTRIBUTES] || [])]
                    : [];

            observedAttributes.push(attributeName);

            if (!target.constructor.hasOwnProperty("observedAttributes"))
            {
                Object.defineProperty(target.constructor, "observedAttributes", { get: () => target[symbols.OBSERVED_ATTRIBUTES] });
            }

            if (descriptor.get && descriptor.set)
            {
                const setter = descriptor.set;

                descriptor.set = function(this: HTMLElement & AttributteConvertable, value: unknown)
                {
                    if (!Object.is(descriptor.get!.call(this), value))
                    {
                        const refletedAttributes = this[symbols.REFLECTED_ATTRIBUTES] = this[symbols.REFLECTED_ATTRIBUTES] || [];

                        setter.call(this, value);

                        refletedAttributes.push(attributeName);

                        this.setAttribute(attributeName, `${value}`);

                        refletedAttributes.splice(refletedAttributes.indexOf(attributeName), 1);
                    }
                };

                const type = Type.from(target);

                const methodInfo = type.getMethod("attributeChangedCallback");
                const callback   = (methodInfo && methodInfo.invoke || null) as Nullable<ProxyFuncion>;

                let converter: Func1<string, unknown>;

                if (args.length == 1)
                {
                    converter = args[0];
                }
                else
                {
                    switch (type.getField(propertyKey)!.metadata["design:type"])
                    {
                        case Boolean:
                            converter = x => x == "true";
                            break;
                        case Number:
                            converter = x => Number.parseFloat(x) || 0;
                            break;
                        default:
                            converter = x => x;
                    }
                }

                const converters = target[symbols.CONVERTERS] = target.hasOwnProperty(symbols.CONVERTERS) ?
                    target[symbols.CONVERTERS]!
                    : !!target[symbols.CONVERTERS] ?
                        {...target[symbols.CONVERTERS] }
                        : { };

                const conversionHandler = (target: Indexer, value: string) =>
                {
                    const current   = target[propertyKey];
                    const converted = converter(value);

                    if (!structuralEqual(current, converted))
                    {
                        target[propertyKey] = converted;
                    }
                };

                converters[attributeName] = conversionHandler;

                if (!callback || !callback[symbols.PROXY_FUNCION])
                {
                    target.attributeChangedCallback = function(this: HTMLElement & AttributteConvertable, name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>)
                    {
                        const reflectedAttributes = this[symbols.REFLECTED_ATTRIBUTES] || [];

                        if (reflectedAttributes.includes(name))
                        {
                            return;
                        }

                        this[symbols.CONVERTERS]![name](this, newValue);

                        if (callback)
                        {
                            callback.call(this, name, oldValue, newValue, namespace);
                        }
                    };

                    if (callback)
                    {
                        callback[symbols.PROXY_FUNCION] = true;
                    }

                    (target.attributeChangedCallback as ProxyFuncion)[symbols.PROXY_FUNCION] = true;
                }
            }
        }
        else
        {
            throw new TypeError("Target is not an valid instance of HTMLElement");
        }
    };

    if (args.length == 1)
    {
        return decorator as Function as PropertyDecorator; // Waiting type definition fix;
    }
    else
    {
        const [target, propertyKey, descriptor] = args;
        decorator(target, propertyKey, descriptor);
    }
}

export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecorator
{
    return <T extends Function>(target: T) =>
    {
        if (typeGuard<Function, typeof HTMLElement>(target, x => x.prototype instanceof HTMLElement))
        {
            if (typeGuard<Function, typeof CustomElement>(target, x => x.prototype instanceof CustomElement))
            {
                const templateElement = document.createElement("template");

                templateElement.innerHTML = template || "<slot></slot>";

                if (style)
                {
                    const styleElement = document.createElement("style");
                    styleElement.innerHTML = style;
                    templateElement.content.prepend(styleElement);
                }

                Object.defineProperty(target, symbols.TEMPLATE, { get: () => templateElement } );

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
        }
        else
        {
            throw new TypeError("Target is not an valid subclass of HTMLElement");
        }
    };
}