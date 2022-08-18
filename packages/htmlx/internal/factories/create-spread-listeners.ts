import type { IDisposable } from "@surface/core";
import eventListener        from "../common.js";
import Metadata             from "../metadata.js";

export default function createSpreadListenersFactory(source: HTMLElement, target: HTMLElement): IDisposable
{
    const metadata = Metadata.from(source);

    const disposables: IDisposable[] = [];

    for (const entry of metadata.context.listeners.values())
    {
        disposables.push(eventListener(target, entry.scope, entry.type, entry.listenerEvaluator, entry.contextEvaluator));
    }

    return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
}