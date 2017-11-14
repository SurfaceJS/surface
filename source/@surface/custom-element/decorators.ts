import { CustomElement }                 from '@surface/custom-element';
import { ClassDecoratorOf, Constructor } from '@surface/types';

export function component<T extends CustomElement>(name: string, template?: string, style?: string, options?: ElementDefinitionOptions): ClassDecoratorOf<T>
{
    return (target: Constructor<T>) =>
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

export function view<T extends CustomElement>(name: string, template: string, style?: string, options?: ElementDefinitionOptions): ClassDecoratorOf<T>
{
    return (target: Constructor<T>) => component<T>(name, template, style, options)(target);
}

export function observe<T extends CustomElement>(...attributes: Array<string>): ClassDecoratorOf<T>
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