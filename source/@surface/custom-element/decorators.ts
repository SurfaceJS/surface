import { Unknown }  from "@surface/core";
import ElementBind  from "./internal/element-bind";
import * as symbols from "./internal/symbols";

export function attribute(target: Object, propertyKey: string | symbol): void
{
    if (!target.constructor[symbols.observedAttributes])
    {
        const values: Array<string> = [];
        Object.defineProperty(target.constructor, symbols.observedAttributes, { get: () => values } );
        Object.defineProperty(target.constructor, "observedAttributes", { get: () => target.constructor[symbols.observedAttributes] });
    }
    target.constructor[symbols.observedAttributes].push(propertyKey);
}

export function element(name: string): ClassDecorator;
export function element(name: string, template:  string): ClassDecorator;
export function element(name: string, template:  string, style:  string): ClassDecorator;
export function element(name: string, template:  string, style:  string, options:  ElementDefinitionOptions): ClassDecorator;
export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecorator
{
    return <T extends Function>(target: T) =>
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

        const proxy = function(this: HTMLElement, ...args: Array<Unknown>)
        {
            const instance = Reflect.construct(target, args, new.target) as HTMLElement;
            ElementBind.for({ host: instance }, instance[symbols.shadowRoot]);

            return instance;
        };

        Object.setPrototypeOf(proxy, Object.getPrototypeOf(target));
        Object.defineProperties(proxy, Object.getOwnPropertyDescriptors(target));

        proxy.prototype.constructor = proxy;

        window.customElements.define(name, proxy, options);

        console.dir(proxy);

        return proxy as Function as T;
    };
}