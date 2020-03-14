import { Nullable } from "@surface/core";

export default interface ICustomElement extends HTMLElement
{
    adoptedCallback?(): void;
    attributeChangedCallback?(attributeName: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>): void;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}