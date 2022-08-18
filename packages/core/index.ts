/* eslint-disable @typescript-eslint/indent */
export type { default as IDisposable } from "./internal/interfaces/disposable.js";

export type
{
    AsyncDelegate,
    Callable,
    Cast,
    ClassDecoratorOf,
    Constructor,
    ConstructorOverload,
    ConstructorParameterOverloads,
    DeepPartial,
    DeepRequired,
    Delegate,
    ExtractFromUnion,
    FieldsOf,
    IgnoreKeysOfType,
    IgnoreOfType,
    Indexer,
    IndexesOf,
    Intersect,
    KeysOfType,
    KeyValue,
    Merge,
    MethodsOf,
    Mix,
    Newable,
    OnlyOfType,
    Overload,
    Overwrite,
    ParameterOverloads,
    PropertyType,
    Required,
    RequiredProperties,
    TypesOf,
    UnionToIntersection,
} from "./internal/types/index.js";

export type { default as CancellationToken } from "./internal/types/cancellation-token.js";
export type { default as MergeRules }        from "./internal/types/merge-rules.js";
export type { default as Subscription }      from "./internal/types/subscription.js";

export { default as CancellationTokenSource } from "./internal/cancellation-token-source.js";
export { default as ArgumentOutOfRangeError } from "./internal/errors/argument-out-of-range-error.js";
export { default as TaskCanceledError }       from "./internal/errors/task-canceled-error.js";
export { default as Event }                   from "./internal/event.js";
export { default as Hashcode }                from "./internal/hashcode.js";
export { default as Hookable }                from "./internal/hookable.js";
export { default as Lazy }                    from "./internal/lazy.js";
export { default as DisposableMetadata }      from "./internal/metadata/disposable-metadata.js";
export { default as HookableMetadata }        from "./internal/metadata/hookable-metadata.js";

export * from "./internal/common/array.js";
export * from "./internal/common/generic.js";
export * from "./internal/common/object.js";
export * from "./internal/common/promises.js";
export * from "./internal/common/string.js";
