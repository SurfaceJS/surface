import RouterSlot from "./router-outlet";

const METADATA = Symbol("view-router:metadata");

export default class Metadata
{
    private readonly target: HTMLElement;
    public readonly outlets: Map<string, RouterSlot> = new Map();

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

    public disposeOutlet(exclude: Set<string>): void
    {
        this.outlets.forEach(x => exclude.has(x.getAttribute("name") ?? "default") || x.clear());
    }

    public getOutlet(tag: string, key: string): RouterSlot | null
    {
        let outlet = this.outlets.get(key) ?? null;

        if (!outlet)
        {
            outlet = this.target.shadowRoot!.querySelector<RouterSlot>(key == "default" ? `${tag}:not([name])` : `${tag}[name=${key}]`);

            if (outlet)
            {
                this.outlets.set(key, outlet);
            }
        }

        return outlet;
    }
}