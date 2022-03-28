import type { IDisposable }       from "@surface/core";
import { onewaybind, twowaybind } from "../common.js";
import Metadata                   from "../metadata.js";

export default function createSpreadBindsFactory(source: HTMLElement, target: HTMLElement): IDisposable
{
    const metadata = Metadata.from(source);

    const disposables: IDisposable[] = [];

    for (const entry of metadata.context.binds.oneway.values())
    {
        disposables.push(onewaybind(target, entry.scope, entry.key, entry.evaluator, entry.observables));
    }

    for (const entry of metadata.context.binds.twoway.values())
    {
        disposables.push(twowaybind(target, entry.scope, entry.left, entry.right));
    }

    return { dispose: () => disposables.splice(0).forEach(x => x.dispose()) };
}