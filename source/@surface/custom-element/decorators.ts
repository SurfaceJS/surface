import { ClassDecoratorOf, Constructor } from '@surface/core/typings';
import { CustomElement } from '@surface/custom-element';

export function component(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecoratorOf<CustomElement>
{
    return (target: Constructor<CustomElement>) =>
    {
        if (template)
        {
            target.prototype.template = templateParse(template, style);
            
            if (window.ShadyCSS)
                window.ShadyCSS.prepareTemplate(target.prototype.template, name, options && options.extends);
        }
        
        window.customElements.define(name, target, options);
    
        return target;
    }
}

export function view(name: string, template: string, style?: string, options?: ElementDefinitionOptions): ClassDecoratorOf<CustomElement>
{
    return (target: Constructor<CustomElement>) => component(name, template, style, options)(target);
}

export function observe(...attributes: Array<string>): ClassDecoratorOf<CustomElement>
{
    return (target: Constructor<CustomElement>) =>
    {
        Object.defineProperty(target, 'observedAttributes', { get: () => attributes } );
        target.prototype[CustomElement.Symbols.observedAttributes] = attributes;
    }
}

function templateParse(template?: string, style?: string): HTMLTemplateElement
{    
    let templateElement = document.createElement('template') as HTMLTemplateElement;

    if (template)
        templateElement.innerHTML = template;

    if (style)
    {
        let styleElement = document.createElement('style') as HTMLStyleElement;
        styleElement.innerHTML = style;
        templateElement.content.appendChild(styleElement);
    }

    return templateElement;
}