/// <reference path="../../../compiler/@types/global/index.d.ts"/>

declare interface ShadyCSS
{
    prepareTemplate(template: HTMLTemplateElement, name: string, element?: string): void;
    styleElement(element: HTMLElement): void;
}

declare interface Window
{
    ShadyCSS?: ShadyCSS;
}