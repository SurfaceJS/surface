import type { Constructor } from "@surface/core";

/**
 * Defines a new custom element.
 * @param tagname tag name to be registered.
 * @param options definition options.
 */
export default function define(tagname: `${string}-${string}`, options?: ElementDefinitionOptions): <TTarget extends Constructor<HTMLElement>>(target: TTarget) => void
{
    return <TTarget extends Constructor<HTMLElement>>(target: TTarget) =>
        window.customElements.define(tagname, target, options);
}