import { Unknown }   from "@surface/core";
import CustomElement from ".";
import ElementBind   from "./internal/element-bind";
import * as symbols  from "./internal/symbols";

function isCustomElement(source: Function): source is typeof CustomElement
{
    return source.prototype instanceof CustomElement;
}

function isHTMLElement(source: Function): source is typeof HTMLElement
{
    return source.prototype instanceof HTMLElement;
}

export function attribute(target: Object, propertyKey: string | symbol): void
{
    if (target instanceof HTMLElement)
    {
        if (!target.constructor[symbols.observedAttributes])
        {
            const values: Array<string> = [];
            Object.defineProperty(target.constructor, symbols.observedAttributes, { get: () => values } );
            Object.defineProperty(target.constructor, "observedAttributes", { get: () => target.constructor[symbols.observedAttributes] });
        }

        target.constructor[symbols.observedAttributes].push(propertyKey);
    }
    else
    {
        throw new TypeError("Target is not an valid instance of HTMLElement");
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

                Object.defineProperty(target, symbols.template, { get: () => templateElement } );

                const proxy = function(this: CustomElement, ...args: Array<Unknown>)
                {
                    const instance = Reflect.construct(target, args, new.target) as CustomElement;

                    ElementBind.for({ host: instance }, instance[symbols.shadowRoot]);

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