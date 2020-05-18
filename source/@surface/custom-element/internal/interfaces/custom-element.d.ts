import { Nullable } from "@surface/core";

export default interface ICustomElement extends HTMLElement
{
    shadowRoot: ShadowRoot;
    adoptedCallback?(): void;
    attributeChangedCallback?(attributeName: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>): void;
    bindedCallback?(): void;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}