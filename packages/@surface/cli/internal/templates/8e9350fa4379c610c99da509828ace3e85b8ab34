import { DirectiveHandler, ICustomDirective } from "@surface/custom-element";
import { Delegate }                           from "@surface/core";

export default class KeyPressDirectiveHandler extends DirectiveHandler
{
    private handler = (event: KeyboardEvent): void =>
    {
        (this.value as Record<string, Delegate | undefined>)[event.key]?.();
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public constructor(scope: object, element: HTMLElement, directive: ICustomDirective)
    {
        super(scope, element, directive);

        element.addEventListener("keypress", this.handler);
    }

    public dispose(): void
    {
        this.element.removeEventListener("keypress", this.handler);

        super.dispose();
    }
}