import { Nullable }  from "@surface/core";
import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import Enumerable    from "@surface/enumerable";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-menu-item", template, style)
export default class MenuItem extends CustomElement
{
    private parent: Nullable<MenuItem>;

    public get items(): Enumerable<MenuItem>
    {
        return super.findAll<MenuItem>("surface-menu-item").where(x => x.parentElement == this);
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

        const items = this.items;

        items.forEach(x => x.parent = this);

        if (this.parent)
        {
            if (items.any())
            {
                super.find("span", true)!.setAttribute("root", "");
            }

            super.addEventListener
            (
                "mouseover",
                () =>
                {
                    const subItems = super.find("sub-items", true)!;
                    const bounding = this.getBoundingClientRect();

                    subItems.style.left = bounding.left + bounding.width < window.innerWidth ? `${bounding.width}px` : `${-bounding.width}px`;
                }
            )
        }
    }
}