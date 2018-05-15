import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import Enumerable    from "@surface/enumerable";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-menu-item", template, style)
export default class MenuItem extends CustomElement
{
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

    public get name(): string
    {
        return super.getAttribute("name") || "";
    }

    public set name(value: string)
    {
        super.setAttribute("collapsed", value);
    }

    public constructor()
    {
        super();

        if (this.parentElement instanceof MenuItem)
        {
            if (this.items.any())
            {
                super.shadowQuery("#arrow")!.setAttribute("root", "");
                const container = super.shadowQuery("#container") as HTMLElement;

                super.addEventListener
                (
                    "mouseover",
                    () =>
                    {
                        const bounding          = this.getBoundingClientRect();
                        const containerBounding = container.getBoundingClientRect();

                        container.style.left = bounding.left + (bounding.width + containerBounding.width) <= window.innerWidth ? `${bounding.width}px` : `${-containerBounding.width}px`;
                    }
                );
            }
            else
            {
                const parentContainer = this.parentElement.shadowQuery("#container") as HTMLElement;

                super.addEventListener("click",      () => parentContainer.style.display = "none");
                super.addEventListener("mouseleave", () => parentContainer.style.display = "");
            }
        }
    }
}