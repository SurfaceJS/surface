/// <reference path='../../../common/@types/global/index.d.ts'/>

declare interface ShadyCSS
{
    prepareTemplate(template: HTMLTemplateElement, name: string, element?: string);
    styleElement(element: HTMLElement);
}

declare interface Window
{
    ShadyCSS: ShadyCSS;
}