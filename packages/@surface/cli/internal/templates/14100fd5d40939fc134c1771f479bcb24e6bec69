import type { DirectiveDescriptor } from "@surface/custom-element";
import { Directive }                from "@surface/custom-element";
import { Delegate }                 from "@surface/core";

export default class KeyPressDirective extends Directive
{
    private handler = (event: KeyboardEvent): void =>
    {
        (this.value as Record<string, Delegate | undefined>)[event.key]?.();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public constructor(scope: object, element: HTMLElement, descriptor: DirectiveDescriptor)
    {
        super(scope, element, descriptor);

        element.addEventListener("keypress", this.handler);
    }

    public dispose(): void
    {
        this.element.removeEventListener("keypress", this.handler);

        super.dispose();
    }
}