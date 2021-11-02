import type { DirectiveContext } from "@surface/htmlx";
import { Directive }             from "@surface/htmlx";
import type WebRouter            from "./web-router.js";

export default class RouterLinkDirective extends Directive
{
    private disposed: boolean = false;

    public constructor(private readonly router: WebRouter, context: DirectiveContext)
    {
        super(context);

        if (context.element instanceof HTMLAnchorElement)
        {
            // eslint-disable-next-line no-script-url
            context.element.href = "javascript:void(0)";
        }

        context.element.addEventListener("click", this.onClick);
    }

    private readonly onClick = (event: MouseEvent): void =>
    {
        if (event.ctrlKey)
        {
            window.open(this.value as string);
        }
        else
        {
            void this.router.push(this.value as string);
        }
    };

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.context.element.removeEventListener("click", this.onClick);

            super.dispose();

            this.disposed = true;
        }
    }
}