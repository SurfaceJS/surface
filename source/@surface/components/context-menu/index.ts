import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import style         from "./index.scss";

@element("surface-context-menu", "", style)
export default class ContexMenu extends CustomElement
{
    public constructor()
    {
        super();

        super.addEventListener("mouseleave", () => super.removeAttribute("visible"));

        this.parentElement!.addEventListener("contextmenu", this.handler.bind(this));
    }

    private handler(event: MouseEvent): void
    {
        super.setAttribute("visible", "");

        const bounding = super.getBoundingClientRect();

        if (event.pageX + (bounding.width / 2) > window.innerWidth)
        {
            super.style.left = `${(window.innerWidth - bounding.width)}px`;
        }
        else if (event.pageX - (bounding.width / 2) < 0)
        {
            super.style.left = "0";
        }
        else
        {
            super.style.left = `${event.pageX - (bounding.width / 2)}px`;
        }
        
        super.style.top  = `${event.pageY}px`;

        event.preventDefault();
    }
}