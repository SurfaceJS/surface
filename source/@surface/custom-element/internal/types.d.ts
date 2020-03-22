import { Indexer } from "@surface/core";

// import { Action, Indexer, Nullable }                                       from "@surface/core";
// import ISubscription                                                       from "@surface/reactive/interfaces/subscription";
// import
// {
//     INJECTED_TEMPLATES,
//     LISTENNING,
//     ON_PROCESS,
//     ON_REMOVED,
//     PROCESSED,
//     SCOPE,
//     SUBSCRIPTIONS
// } from "./symbols";

// export type Bindable<T extends object> = T &
// {
//     [SCOPE]?:              Indexer;
//     [ON_PROCESS]?:         Action;
//     [ON_REMOVED]?:         Action;
//     [PROCESSED]?:          boolean;
//     [INJECTED_TEMPLATES]?: Map<string, Nullable<HTMLTemplateElement>>;
// };

// export type Subscriber        = object & { [SUBSCRIPTIONS]?: Array<ISubscription> };
// export type ElementSubscriber = Subscriber & { [LISTENNING]?: boolean };

export type Scope = Indexer & { host?: HTMLElement };