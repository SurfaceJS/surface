import { IDisposable } from "@surface/core";

export default interface ICustomlement extends HTMLElement, Partial<IDisposable>
{
    shadowRoot: ShadowRoot;
    adoptedCallback?(): void;
    attributeChangedCallback?(attributeName: string, oldValue: string | undefined, newValue: string, namespace: string | undefined): void;
    connectedCallback?(): void;
    dispose?(): void;
    disconnectedCallback?(): void;
}