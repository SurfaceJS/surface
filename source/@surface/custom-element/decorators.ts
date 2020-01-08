import { Func1, Indexer, Nullable } from "@surface/core";
import { typeGuard }                from "@surface/core/common/generic";
import { camelToDashed }            from "@surface/core/common/string";
import Reactive                     from "@surface/reactive";
import Type                         from "@surface/reflection";
import CustomElement                from ".";
import ICustomElement               from "./interfaces/custom-element";
import * as symbols                 from "./internal/symbols";
import TemplateProcessor            from "./internal/template-processor";
import { Metadata }                 from "./internal/types";

export function attribute(converter: Func1<string, unknown>): PropertyDecorator;
//export function attribute(reflect: boolean): PropertyDecorator;
// export function attribute(converter: Func1<string, unknown>, reflect: boolean): PropertyDecorator;
export function attribute(target: object, propertyKey: string|symbol): void;
export function attribute(...args: [Func1<string, unknown>] | [object, string | symbol, PropertyDescriptor?]): PropertyDecorator | void
// export function attribute(...args: [Func1<string, unknown>, boolean] | [Func1<string, unknown> | boolean] | [object, string | symbol, PropertyDescriptor?]): PropertyDecorator | void
{
    // const [converter, reflect] = args.length == 3
    //     ? [null, false]
    //     : args.length == 2
    //         ? typeof args[0] == "function"
    //             ? [null, false]
    //             : args as [Func1<string, unknown>, boolean]
    //         : typeof args[0] == "boolean"
    //             ? [null, args[0]]
    //             : [args[0], false];

    const decorator = (target: { [symbols.METADATA]?: Metadata }, propertyKey: string|symbol) =>
    {
        if (typeGuard<object, ICustomElement & { [symbols.METADATA]?: Metadata }>(target, x => x instanceof HTMLElement) && typeof propertyKey == "string")
        {
            const attributeName = camelToDashed(propertyKey);

            const hasInheritance = !target.hasOwnProperty(symbols.METADATA) && !!target[symbols.METADATA];

            const metadata = target[symbols.METADATA] = hasInheritance
                ? { ...target[symbols.METADATA] }
                : target[symbols.METADATA] ?? { };

            const observedAttributes = metadata.observedAttributes = hasInheritance
                ? [ ...metadata.observedAttributes ?? []]
                : metadata.observedAttributes ?? [];

            const conversionHandlers = metadata.conversionHandlers = hasInheritance
                ? { ...metadata.conversionHandlers }
                : metadata.conversionHandlers ?? { };

            observedAttributes.push(attributeName);

            if (!target.constructor.hasOwnProperty("observedAttributes"))
            {
                Object.defineProperty(target.constructor, "observedAttributes", { get: () => observedAttributes });
            }

            // if (reflect)
            // {
            //     const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

            //     if (descriptor?.set)
            //     {
            //         Object.defineProperty
            //         (
            //             target,
            //             propertyKey,
            //             {
            //                 configurable: true,
            //                 get: descriptor?.get,
            //                 set(this: HTMLElement, value: unknown)
            //                 {
            //                     if (!Object.is(descriptor.get!.call(this), value))
            //                     {
            //                         const refletedAttributes = metadata.reflectedAttributes = metadata.reflectedAttributes ?? [];

            //                         descriptor.set!.call(this, value);

            //                         refletedAttributes.push(attributeName);

            //                         this.setAttribute(attributeName, `${value}`);

            //                         refletedAttributes.splice(refletedAttributes.indexOf(attributeName), 1);
            //                     }
            //                 }
            //             }
            //         );
            //     }
            //     else if (!descriptor || descriptor.writable)
            //     {
            //         const privateKey = `_${propertyKey.toString()}`;

            //         Object.defineProperty
            //         (
            //             target,
            //             propertyKey,
            //             {
            //                 configurable: true,
            //                 get(this: Indexer)
            //                 {
            //                     return this[privateKey as string];
            //                 },
            //                 set(this: Indexer & HTMLElement, value: unknown)
            //                 {
            //                     if (!Object.is(this[privateKey as string], value))
            //                     {
            //                         const refletedAttributes = metadata.reflectedAttributes = metadata.reflectedAttributes ?? [];

            //                         this[privateKey as string] = value;

            //                         refletedAttributes.push(attributeName);

            //                         this.setAttribute(attributeName, `${value}`);

            //                         refletedAttributes.splice(refletedAttributes.indexOf(attributeName), 1);
            //                     }
            //                 }
            //             }
            //         );
            //     }
            // }

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

            const attributeChangedCallback = target["attributeChangedCallback"];

            if (!attributeChangedCallback || attributeChangedCallback != metadata.attributeChangedCallback)
            {
                target.attributeChangedCallback = function(this: HTMLElement & { [symbols.METADATA]?: Metadata }, name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>)
                {
                        // if (metadata.reflectedAttributes?.includes(name))
                        // {
                        //     return;
                        // }

                    this[symbols.METADATA]?.conversionHandlers?.[name](this as Indexer, newValue);

                    attributeChangedCallback?.call(this, name, oldValue, newValue, namespace);
                };

                metadata.attributeChangedCallback = target.attributeChangedCallback;
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
        const [target, propertyKey] = args;

        decorator(target, propertyKey);
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

export function notify(property: string): PropertyDecorator
{
    return (target: object, propertyKey: string|symbol) =>
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

                        Reactive.getReactor(this)?.notify(this as Indexer, property);
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

                        Reactive.getReactor(this)?.notify(this, property);
                    }
                }
            );
        }
    };
}