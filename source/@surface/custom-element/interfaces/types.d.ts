import { Nullable } from "@surface/core";

export type LifeCycle<T extends HTMLElement = HTMLElement> = T &
{
    adoptedCallback?(): void;
    attributeChangedCallback?(attributeName: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>): void;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}