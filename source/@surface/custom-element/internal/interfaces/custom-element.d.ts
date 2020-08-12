export default interface ICustomlement extends HTMLElement
{
    shadowRoot: ShadowRoot;
    adoptedCallback?(): void;
    attributeChangedCallback?(attributeName: string, oldValue: string | undefined, newValue: string, namespace: string | undefined): void;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}