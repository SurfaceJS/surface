interface HTMLElement
{ }

interface HTMLTemplateElement
{ }

declare interface ShadyCSS
{
    prepareTemplate(template: HTMLTemplateElement, name: string, element?: string): void;
    styleElement(element: HTMLElement): void;
}

declare interface Window
{
    ShadyCSS?: ShadyCSS;
}