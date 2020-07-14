import { RouterSlot } from "..";

const METADATA = Symbol("view-router:metadata");

export default class Metadata
{
    private readonly target: HTMLElement;
    public readonly slots: Map<string, RouterSlot> = new Map();

    public constructor(target: HTMLElement)
    {
        this.target = target;
    }

    public static from(target: HTMLElement & { [METADATA]?: Metadata }): Metadata
    {
        return target[METADATA] = target[METADATA] ?? new Metadata(target);
    }

    public static of(target: HTMLElement & { [METADATA]?: Metadata }): Metadata|undefined
    {
        return target[METADATA];
    }

    public disposeSlots(exclude: Set<string>): void
    {
        this.slots.forEach(x => exclude.has(x.getAttribute("name") ?? "default") || x.clear());
    }

    public getSlot(tag: string, key: string): RouterSlot | null
    {
        let slot = this.slots.get(key) ?? null;

        if (!slot)
        {
            slot = this.target.shadowRoot!.querySelector<RouterSlot>(key == "default" ? `${tag}:not([name])` : `${tag}[name=${key}]`);

            if (slot)
            {
                this.slots.set(key, slot);
            }
        }

        return slot;
    }
}