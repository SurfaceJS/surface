import type { Indexer }       from "@surface/core";
import { hasValue }           from "@surface/core";
import type { Observer }      from "@surface/reactive";
import Reactive, { Metadata } from "@surface/reactive";
import type Scheduler         from "../processors/scheduler.js";
import AsyncObserver          from "./async-observer.js";

export default class AsyncReactive extends Reactive
{
    protected static observe(root: Object, path: string[], observer: Observer): void
    {
        if (root instanceof HTMLElement && (root.contentEditable == "true" || root.nodeName == "INPUT"))
        {
            const [key, ...keys] = path;

            const metadata = Metadata.from(root);

            let subject = metadata.subjects.get(key);

            if (!subject)
            {
                const action = (event: Event): void =>
                {
                    event.stopImmediatePropagation();

                    for (const [observer] of Metadata.from(root).subjects.get(key)!)
                    {
                        observer.notify();
                    }
                };

                root.addEventListener("input", action);

                this.observeProperty(root, key);

                metadata.subjects.set(key, subject = new Map());
            }

            subject.set(observer, keys);

            const property = (root as unknown as Indexer)[key];

            if (keys.length > 0 && hasValue(property))
            {
                this.observe(property, keys, observer);
            }
        }
        else
        {
            super.observe(root, path, observer);
        }
    }

    public static from(root: object, path: string[], scheduler?: Scheduler): Observer
    {
        if (scheduler)
        {
            const key = path.join("\u{fffff}");

            const metadata = Metadata.from(root);

            let observer = metadata.observers.get(key);

            if (!observer)
            {
                this.observe(root, path, observer = new AsyncObserver(root, path, scheduler));

                metadata.observers.set(key, observer);
                metadata.disposables.push({ dispose: () => this.unobserve(root, path, observer!) });
            }

            return observer;
        }

        return super.from(root, path);
    }
}