import { Action, Indexer, Nullable }                                       from "@surface/core";
import ISubscription                                                       from "@surface/reactive/interfaces/subscription";
import
{
    INJECTED_TEMPLATES,
    LISTENNING,
    ON_PROCESS,
    ON_REMOVED,
    PROCESSED,
    SCOPE,
    SUBSCRIPTIONS
} from "./symbols";

export type Bindable<T extends object> = T &
{
    [SCOPE]?:              Indexer;
    [ON_PROCESS]?:         Action;
    [ON_REMOVED]?:         Action;
    [PROCESSED]?:          boolean;
    [INJECTED_TEMPLATES]?: Map<string, Nullable<HTMLTemplateElement>>;
};

export type Subscriber        = object & { [SUBSCRIPTIONS]?: Array<ISubscription> };
export type ElementSubscriber = Subscriber & { [LISTENNING]?: boolean };

export type Metadata =
{
    attributeChangedCallback?: (name: string, oldValue: Nullable<string>, newValue: string, namespace: Nullable<string>) => void;
    conversionHandlers?:       Indexer<(target: Indexer, value: string) => void>
    observedAttributes?:       Array<string>;
    reflectedAttributes?:      Array<string>;
};

export type StaticMetadata =
{
    observedAttributes?: Array<string>;
    styles?:             Array<string>;
    template?:           HTMLTemplateElement;
};