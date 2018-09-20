import { Nullable } from "@surface/core";

export type LifeCycle<T> = T &
{
    adoptedCallback?(): void;
    attributeChangedCallback?(attributeName: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>): void;
    connectedCallback?(): void;
    disconnectedCallback?(): void;
}