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
        return super.getAttribute("icon") || "" as string;
    }

    public set icon(value: string)
    {
        super.setAttribute("icon", value.toString());
    }

    public get items(): Enumerable<MenuItem>
    {
        return Enumerable.from(Array.from(super.querySelectorAll<MenuItem>("surface-menu-item"))).where(x => x.parentElement == this);
    }

    public get label(): string
    {
        return super.getAttribute("label") || "";
    }

    public set label(value: string)
    {
        super.setAttribute("label", value);
    }

    public constructor()
    {
        super();
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
        const container         = super.references.container as HTMLElement;
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

    protected connectedCallback(): void
    {
        const hasItems = this.items.any();

        if (hasItems)
        {
            super.references.root!.setAttribute("has-items", "");
        }

        if (this.parentElement instanceof MenuItem)
        {
            super.addEventListener("mouseover", this.onMouseOver.bind(this));

            if (!hasItems)
            {
                this.parentContainer = this.parentElement.references.container!;

                super.addEventListener("click", this.onClick.bind(this));
                super.addEventListener("mouseleave", this.onMouseLeave.bind(this));
            }
        }
        else
        {
            super.addEventListener("mouseover", this.onMouseOver.bind(this));

            if (this.parentElement instanceof ContexMenu)
            {
                super.addEventListener("click", this.onClick.bind(this));
                super.addEventListener("mouseleave", this.onMouseLeave.bind(this));
            }
        }
    }

    protected disconnectedCallback(): void
    {
        super.removeEventListener("click", this.onClick);
        super.removeEventListener("mouseleave", this.onMouseLeave);
        super.removeEventListener("mouseover", this.onMouseOver);
        super.references.root!.removeAttribute("has-items");
    }
}