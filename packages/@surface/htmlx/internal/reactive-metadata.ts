import { DisposableMetadata } from "@surface/core";
import Metadata               from "./metadata.js";

const METADATA = Symbol("htmlx:reactive-metadata");

export default class ReactiveMetadata
{
    public injections:   string[] = [];
    public placeholders: string[] = [];

    public static from(target: Node): ReactiveMetadata
    {
        if (!Reflect.has(target, METADATA))
        {
            const reactiveMetadata = new ReactiveMetadata();

            const injectionsSubscription   = Metadata.from(target).injections.subscribe(x => reactiveMetadata.injections = Array.from(x.keys()));
            const placeholdersSubscription = Metadata.from(target).placeholders.subscribe(x => reactiveMetadata.placeholders = Array.from(x.keys()));

            DisposableMetadata.from(reactiveMetadata).add({ dispose: () => (injectionsSubscription.unsubscribe(), placeholdersSubscription.unsubscribe()) });

            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: reactiveMetadata });
        }

        return Reflect.get(target, METADATA);
    }
}