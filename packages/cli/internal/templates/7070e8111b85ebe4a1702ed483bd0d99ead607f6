import type { DirectiveContext } from "@surface/htmlx";
import { Directive }             from "@surface/htmlx";
import { Delegate }              from "@surface/core";

export default class KeyPressDirective extends Directive
{
    private handler = (event: KeyboardEvent): void =>
    {
        (this.value as Record<string, Delegate | undefined>)[event.key]?.();
    }

    public constructor(context: DirectiveContext)
    {
        super(context);

        context.element.addEventListener("keypress", this.handler);
    }

    public dispose(): void
    {
        this.context.element.removeEventListener("keypress", this.handler);

        super.dispose();
    }
}