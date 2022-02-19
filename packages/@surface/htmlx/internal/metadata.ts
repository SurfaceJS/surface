import type { Delegate }       from "@surface/core";
import type { ObservablePath } from "@surface/htmlx-parser";
import type { Evaluator }      from "../index.js";
import ReactiveMap             from "./reactive-map.js";
import type InjectionContext   from "./types/injection-context";

const METADATA = Symbol("htmlx:metadata");

type OnewayContext = { key: string, evaluator: Evaluator, scope: object, observables: ObservablePath[] };
type TwowayContext = { left: string, right: ObservablePath, scope: object };

type BindContexts =
{
    oneway: Map<string, OnewayContext>,
    twoway: Map<string, TwowayContext>,
};

type ListenerContext = { scope: object, type: string, listenerEvaluator: Evaluator, contextEvaluator: Evaluator };

type FactoryContext =
{
    binds:     BindContexts,
    listeners: Map<string, ListenerContext>,
};

export default class Metadata
{
    public readonly defaults:     Map<string, Delegate>                             = new Map();
    public readonly injections:   ReactiveMap<string, InjectionContext>             = new ReactiveMap();
    public readonly placeholders: ReactiveMap<string, Delegate<[InjectionContext]>> = new ReactiveMap();
    public readonly listeners:    ReactiveMap<string, Delegate>                     = new ReactiveMap();

    public readonly context: FactoryContext =
        {
            binds:
            {
                oneway: new Map(),
                twoway: new Map(),
            },
            listeners: new Map(),
        };

    public static from(target: Node): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }
}