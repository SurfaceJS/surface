import { DirectiveHandler, ICustomDirective } from "@surface/custom-element";
import ViewRouter                             from "./view-router";

export default class NavigationDirectiveHandler extends DirectiveHandler
{
    private disposed: boolean = false;

    public constructor(private readonly router: ViewRouter, scope: object, element: HTMLElement, directive: ICustomDirective)
    {
        super(scope, element, directive);

        if (this.element instanceof HTMLAnchorElement)
        {
            this.element.href = "javascript:void(0)";
        }

        this.element.addEventListener("click", this.to.bind(this));
    }

    private to(event: MouseEvent): void
    {
        if (event.ctrlKey)
        {
            window.open(this.value as string);
        }
        else
        {
            this.router.push(this.value as string);
        }
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.element.removeEventListener("click", this.to);

            super.dispose();

            this.disposed = false;
        }
    }
}