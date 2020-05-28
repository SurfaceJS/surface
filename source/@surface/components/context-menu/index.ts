import CustomElement from "@surface/custom-element";
import { element }   from "../decorators";
import style         from "./index.scss";

@element("surface-context-menu", "", style)
export default class ContexMenu extends CustomElement
{
    public constructor()
    {
        super();

        this.addEventListener("mouseleave", () => this.removeAttribute("visible"));

        this.parentElement!.addEventListener("contextmenu", this.handler.bind(this));
    }

    private handler(event: MouseEvent): void
    {
        this.setAttribute("visible", "");

        const bounding = this.getBoundingClientRect();

        if (event.pageX + (bounding.width / 2) > window.innerWidth)
        {
            this.style.left = `${(window.innerWidth - bounding.width)}px`;
        }
        else if (event.pageX - (bounding.width / 2) < 0)
        {
            this.style.left = "0";
        }
        else
        {
            this.style.left = `${event.pageX - (bounding.width / 2)}px`;
        }

        this.style.top  = `${event.pageY}px`;

        event.preventDefault();
    }
}