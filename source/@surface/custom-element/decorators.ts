import { CustomElement }      from "./index";
import { observedAttributes } from "./symbols";

export function element(name: string): ClassDecorator;
export function element(name: string, template:  string): ClassDecorator;
export function element(name: string, template:  string, style:  string): ClassDecorator;
export function element(name: string, template:  string, style:  string, options:  ElementDefinitionOptions): ClassDecorator;
export function element(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecorator
{
    return (target: Object) =>
    {
        if (isCustomElement(target))
        {
            if (template)
            {
                let templateElement = document.createElement("template") as HTMLTemplateElement;

                templateElement.innerHTML = template;

                if (style)
                {
                    let styleElement = document.createElement("style") as HTMLStyleElement;
                    styleElement.innerHTML = style;
                    templateElement.content.appendChild(styleElement);
                }

                target.prototype.template = templateElement;

                if (window.ShadyCSS)
                {
                    window.ShadyCSS.prepareTemplate(target.prototype.template, name, options && options.extends);
                }
            }

            window.customElements.define(name, target, options);
        }
        else
        {
            throw new TypeError("Constructor is not an valid subclass of @surface/custom-element.");
        }
    };
}

export function observe(...attributes: Array<string>): ClassDecorator
{
    return (target: Object) =>
    {
        if (isCustomElement(target))
        {
            Object.defineProperty(target, "observedAttributes", { get: () => attributes } );
            target.prototype[observedAttributes] = attributes;
        }
        else
        {
            throw new TypeError("Constructor is not an valid subclass of @surface/custom-element.");
        }
    };
}

function isCustomElement(source: Object): source is typeof CustomElement
{
    return source["prototype"] instanceof CustomElement;
}