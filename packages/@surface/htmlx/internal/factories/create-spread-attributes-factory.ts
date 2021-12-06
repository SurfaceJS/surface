import type { IDisposable } from "@surface/core";
import { scheduler }        from "../singletons.js";

export default function createSpreadAttributesFactory(source: HTMLElement, target: HTMLElement): IDisposable
{
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < source.attributes.length; index++)
    {
        const attribute = source.attributes[index];

        target.setAttribute(attribute.name, attribute.value);
    }

    const callback: MutationCallback = records =>
    {
        const action = (): void =>
        {
            for (const record of records)
            {
                const value = source.getAttribute(record.attributeName!);

                if (value === null)
                {
                    target.removeAttribute(record.attributeName!);
                }
                else
                {
                    target.setAttribute(record.attributeName!, value);
                }
            }
        };

        void scheduler.enqueue(action, "high");
    };

    const observer = new MutationObserver(callback);

    observer.observe(source, { attributes: true });

    return { dispose: () => observer.disconnect() };
}