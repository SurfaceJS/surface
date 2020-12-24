import type { Indexer }                         from "@surface/core";
import { DisposableMetadata, HookableMetadata } from "@surface/core";

export default function event<K extends keyof HTMLElementEventMap>(type: K, options?: boolean | AddEventListenerOptions): (target: HTMLElement, propertyKey: string | symbol) => void
{
    return (target: HTMLElement, propertyKey: string | symbol) =>
    {
        const action = (element: HTMLElement): void =>
        {
            const listener = (event: HTMLElementEventMap[K]): unknown => (element as object as Indexer<Function>)[propertyKey as string]!.call(element, event);

            element.addEventListener(type, listener, options);

            DisposableMetadata.from(element).add({ dispose: () => element.removeEventListener(type, listener) });
        };

        HookableMetadata.from(target.constructor as typeof HTMLElement).initializers.push(action);
    };
}