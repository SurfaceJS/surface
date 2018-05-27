import CustomElement from "./index";
import * as symbols  from "./internal/symbols";

export function attribute(target: Object, propertyKey: string | symbol): void
{
    if (target instanceof HTMLElement)
    {
        if (!target.constructor[symbols.observedAttributes] && !target.constructor[symbols.observedAttributes])
        {
            const values: Array<string> = [];
            Object.defineProperty(target.constructor, symbols.observedAttributes, { get: () => values } );
            Object.defineProperty(target.constructor, "observedAttributes", { get: () => target.constructor[symbols.observedAttributes] });
        }
        target.constructor[symbols.observedAttributes].push(propertyKey);
    }
    else
    {
        throw new TypeError("Target is not an valid subclass of HTMLElement");
    }
}

export function element(name: string): ClassDecorator;
export function element(name: string, template:  string): ClassDecorator;
export function element(name: string, template:  string, style:  string): ClassDecorator;
export function element(name: string, template:  string, style:  string, options:  ElementDefinitionOptions): ClassDecorator;
export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecorator
{
    return (target: Function) =>
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
            }
            else
            {
                throw new TypeError("constructor is not an valid subclass of CustomElement");
            }

            window.customElements.define(name, target, options);
        }
        else
        {
            throw new TypeError("constructor is not an valid subclass of HTMLElement");
        }
    };
}

function isCustomElement(source: Function): source is typeof CustomElement
{
    return source.prototype instanceof CustomElement;
}

function isHTMLElement(source: Function): source is typeof HTMLElement
{
    return source.prototype instanceof HTMLElement;
}