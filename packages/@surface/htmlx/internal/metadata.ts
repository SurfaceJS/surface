import type { Delegate }     from "@surface/core";
import ReactiveMap           from "./reactive-map.js";
import type InjectionContext from "./types/injection-context";

const METADATA = Symbol("htmlx:metadata");

type LinkedElements =
{
    binds:
    {
        oneway: HTMLElement[],
        twoway: HTMLElement[],
    },
    injections: HTMLElement[],
    listeners:  HTMLElement[],
};

export default class Metadata
{
    public readonly defaults:       Map<string, Delegate>                             = new Map();
    public readonly injections:     ReactiveMap<string, InjectionContext>             = new ReactiveMap();
    public readonly placeholders:   ReactiveMap<string, Delegate<[InjectionContext]>> = new ReactiveMap();
    public readonly linkedElements: LinkedElements =
        {
            binds:
            {
                oneway: [],
                twoway: [],
            },
            injections: [],
            listeners:  [],
        };

    public static from(target: Node): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: new Metadata() });
        }

        return Reflect.get(target, METADATA);
    }

    public static of(target: Node): Metadata | null
    {
        return Reflect.get(target, METADATA);
    }
}