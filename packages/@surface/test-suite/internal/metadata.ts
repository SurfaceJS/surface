import type { Delegate } from "@surface/core";

const METADATA = Symbol("test-suite:metadata");

export default class Metadata
{
    public after:       boolean = false;
    public afterEach:   boolean = false;
    public batch?:      { source: unknown[], expectation: Delegate<[data: unknown, index: number], string>, skip: Delegate<[data: unknown, index: number], boolean> };
    public before:      boolean = false;
    public beforeEach:  boolean = false;
    public category:    string = "";
    public description: string  = "";
    public expectation: string  = "";
    public skip:        boolean = false;
    public suite:       boolean = false;
    public test:        boolean = false;

    public static from(target: object): Metadata
    {
        if (!Reflect.has(target, METADATA))
        {
            const metadata = new Metadata();

            Reflect.defineProperty(target, METADATA, { configurable: false, enumerable: false, value: metadata });
        }

        return Reflect.get(target, METADATA) as Metadata;
    }
}