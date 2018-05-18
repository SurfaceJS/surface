import { Nullable }  from "@surface/core";
import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import Enumerable    from "@surface/enumerable";
import { Menu }      from "../menu";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-menu-item", template, style)
export default class MenuItem extends CustomElement
{
    private readonly container:   HTMLElement;
    private readonly inlineArrow: HTMLElement;
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
        return super.queryAll<MenuItem>("surface-menu-item").where(x => x.parentElement == this);
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
        this.container   = super.shadowQuery("#container")!;
        this.inlineArrow = super.shadowQuery("#inline-arrow")!;
    }

    private onClick(): void
    {
        this.parentContainer!.style.display = "none";
    }

    private onMouseLeave(): void
    {
        this.parentContainer!.style.display = "";
    }

    private onMouseOver(root: boolean): void
    {
        const bounding          = this.getBoundingClientRect();
        const containerBounding = this.container.getBoundingClientRect();

        if (root)
        {
            let offset = 0;
            if (this.parentElement instanceof Menu && this.parentElement.orientation == Menu.Orientation.Vertical)
            {
                this.container.style.top = "0";
                offset = bounding.width;
            }
            this.container.style.left = bounding.left + containerBounding.width <= window.innerWidth ? `${offset}px` : `${-(containerBounding.width -(window.innerWidth - bounding.left))}px`;
        }
        else
        {
            this.container.style.left = bounding.left + (bounding.width + containerBounding.width) <= window.innerWidth ? `${bounding.width}px` : `${-containerBounding.width}px`;
        }
    }

    private onMouseOverItem(): void
    {
        this.onMouseOver(false);
    }

    private onMouseOverRoot(): void
    {
        this.onMouseOver(true);
    }

    protected connectedCallback(): void
    {
        const hasItems = this.items.any();

        if (hasItems)
        {
            this.inlineArrow.setAttribute("has-items", "");
        }

        if (this.parentElement instanceof MenuItem)
        {
            super.addEventListener("mouseover", this.onMouseOverItem.bind(this));

            if (!hasItems)
            {
                this.parentContainer = this.parentElement.shadowQuery("#container") as HTMLElement;

                super.addEventListener("click", this.onClick.bind(this));
                super.addEventListener("mouseleave", this.onMouseLeave.bind(this));
            }
        }
        else
        {
            super.addEventListener("mouseover", this.onMouseOverRoot.bind(this));
        }
    }

    protected disconnectedCallback(): void
    {
        super.removeEventListener("click", this.onClick);
        super.removeEventListener("mouseleave", this.onMouseLeave);
        super.removeEventListener("mouseover", this.onMouseOverItem);
        super.removeEventListener("mouseover", this.onMouseOverRoot);
        this.inlineArrow.removeAttribute("has-items");
    }
}