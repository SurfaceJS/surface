import { Constructor } from "@surface/core";
import CustomElement   from "@surface/custom-element";

// tslint:disable:no-any
export const rippleMixin = (superClass: Constructor<CustomElement>) => class Ripple extends superClass
{
    private readonly ripple: HTMLElement;

    public constructor(...args: Array<any>)
    {
        super(...args);

        const ripple = super.references.ripple;

        if (!ripple)
        {
            throw new Error("ripple element not founded");
        }

        super.addEventListener("click", x => this.handleClick(x));
        //ripple.addEventListener("animationend", () => this.ripple.classList.remove("ripple"));

        this.ripple = ripple;
    }

    private handleClick(event: MouseEvent): void
    {
        const bounding = super.getBoundingClientRect();

        const x = event.pageX - bounding.x;
        const y = event.pageY - bounding.y;

        const span = document.createElement("span");

        span.classList.add("ripple");

        span.style.left = `${x + -50}px`;
        span.style.top  = `${y + -50}px`;

        this.ripple.append(span);

        span.addEventListener("animationend", () => this.ripple.removeChild(span));
    }
};