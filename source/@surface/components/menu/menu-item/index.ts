import { Nullable }  from "@surface/core";
import CustomElement from "@surface/custom-element";
import Enumerable    from "@surface/enumerable";
import Menu          from "..";
import ContexMenu    from "../../context-menu";
import { element }   from "../../decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-menu-item", template, style)
export default class MenuItem extends CustomElement
{
    private parentContainer: Nullable<HTMLElement>;
    public get icon(): string
    {
        return this.getAttribute("icon") || "" as string;
    }

    public set icon(value: string)
    {
        this.setAttribute("icon", value.toString());
    }

    public get items(): Enumerable<MenuItem>
    {
        return Enumerable.from(Array.from(this.querySelectorAll<MenuItem>("surface-menu-item"))).where(x => x.parentElement == this);
    }

    public get label(): string
    {
        return this.getAttribute("label") || "";
    }

    public set label(value: string)
    {
        this.setAttribute("label", value);
    }

    private onClick(): void
    {
        if (this.parentElement instanceof ContexMenu)
        {
            this.parentElement.style.display = "none";
        }
        else
        {
            this.parentContainer!.style.display = "none";
        }
    }

    private onMouseLeave(): void
    {
        if (this.parentElement instanceof ContexMenu)
        {
            this.parentElement.style.display = "";
        }
        else
        {
            this.parentContainer!.style.display = "";
        }
    }

    private onMouseOver(): void
    {
        const container         = this.references.container as HTMLElement;
        const bounding          = this.getBoundingClientRect();
        const containerBounding = container.getBoundingClientRect();

        let offset = 0;
        if (this.parentElement instanceof ContexMenu)
        {
            container.style.top = "0";
            offset = bounding.width;
        }

        if (this.parentElement instanceof Menu)
        {
            container.style.left = bounding.left + containerBounding.width <= window.innerWidth ? `${offset}px` : `${-(containerBounding.width -(window.innerWidth - bounding.left))}px`;
        }
        else
        {
            container.style.top  = "0";
            container.style.left = bounding.left + (bounding.width + containerBounding.width) <= window.innerWidth ? `${bounding.width}px` : `${-containerBounding.width}px`;
        }
    }

    public connectedCallback(): void
    {
        const hasItems = this.items.any();

        if (hasItems)
        {
            this.references.root!.setAttribute("has-items", "");
        }

        if (this.parentElement instanceof MenuItem)
        {
            this.addEventListener("mouseover", this.onMouseOver.bind(this));

            if (!hasItems)
            {
                this.parentContainer = this.parentElement.references.container!;

                this.addEventListener("click", this.onClick.bind(this));
                this.addEventListener("mouseleave", this.onMouseLeave.bind(this));
            }
        }
        else
        {
            this.addEventListener("mouseover", this.onMouseOver.bind(this));

            if (this.parentElement instanceof ContexMenu)
            {
                this.addEventListener("click", this.onClick.bind(this));
                this.addEventListener("mouseleave", this.onMouseLeave.bind(this));
            }
        }
    }

    public disconnectedCallback(): void
    {
        this.removeEventListener("click", this.onClick);
        this.removeEventListener("mouseleave", this.onMouseLeave);
        this.removeEventListener("mouseover", this.onMouseOver);
        this.references.root!.removeAttribute("has-items");
    }
}