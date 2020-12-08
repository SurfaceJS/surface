import type { Constructor } from "@surface/core";

export default function define(name: string, options?: ElementDefinitionOptions): <TTarget extends Constructor<HTMLElement>>(target: TTarget) => void
{
    return <TTarget extends Constructor<HTMLElement>>(target: TTarget) =>
        window.customElements.define(name, target, options);
}