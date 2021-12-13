import type { IDisposable } from "@surface/core";
import Metadata             from "../metadata.js";

export default function createSpreadInjectionsFactory(source: HTMLElement, target: HTMLElement): IDisposable
{
    const sourceMetadata = Metadata.from(source);
    const targetMetadata = Metadata.from(target);

    const disposables: IDisposable[] = [];

    for (const [key, value] of sourceMetadata.injections)
    {
        targetMetadata.injections.set(key, value);

        const action = targetMetadata.placeholders.get(key);

        if (action)
        {
            action(value);
        }

        const dispose = (): void =>
        {
            targetMetadata.injections.delete(key);
            targetMetadata.defaults.get(key)?.();
        };

        disposables.push({ dispose });
    }

    return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
}