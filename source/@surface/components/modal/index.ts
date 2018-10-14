import { Nullable }           from "@surface/core";
import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";
import style                  from "./index.scss";

export type Position =
{
    x: number,
    y: number,
    align:
    {
        horizontal: "left"|"center"|"right",
        vertical:   "top"|"center"|"bottom"
    }
};

@element("surface-modal", template, style)
export default class Modal extends Component
{
    private _centered!: boolean;

    @attribute
    public get centered(): boolean
    {
        return this._centered;
    }

    public set centered(value: boolean)
    {
        this._centered = value;
    }

    public get visible(): boolean
    {
        return super.style.display == "flex";
    }

    public set visible(value: boolean)
    {
        super.style.display = value ? "flex" : "none";
    }

    public constructor(template?: HTMLTemplateElement)
    {
        super();

        if (template)
        {
            super.appendChild(document.importNode(template.content, true));
        }
        this.centered = true;
    }

    protected attributeChangedCallback(name: "centered", _: Nullable<string>, newValue: string)
    {
        const value = newValue == "true";

        if (value != this[name])
        {
            this[name] = value;
        }
    }

    public hide()
    {
        this.visible = false;

        if (this.parentNode == document.body)
        {
            document.body.removeChild(this);
        }
    }

    public show(position?: Position)
    {
        if (!this.parentNode)
        {
            document.body.appendChild(this);
        }

        this.visible = true;

        if (position)
        {
            super.style.position = "absolute";

            const bounding = super.getBoundingClientRect();
            this.centered  = false;

            const offset =
            {
                horizontal:
                {
                    "left":   0,
                    "center": -(bounding.width / 2),
                    "right":  -bounding.width
                },
                vertical:
                {
                    "top":    0,
                    "center": -(bounding.height / 2),
                    "bottom": -bounding.height
                }
            };

            const left = position.x + offset.horizontal[position.align.horizontal];
            const top  = position.y + offset.vertical[position.align.vertical];

            //super.style.left = `${left > 0 ? left < window.innerWidth  - bounding.width  ? left : window.innerWidth  - bounding.width  : 0}px`;
            super.style.left = `${(left > 0 ? left < window.outerWidth  - bounding.width  ? left : window.outerWidth  - bounding.width  : 0) + window.scrollX}px`;
            super.style.top  = `${(top  > 0 ? top  < window.innerHeight - bounding.height ? top  : window.innerHeight - bounding.height : 0) + window.scrollY}px`;
        }
        else if (this.centered)
        {
            super.style.position = "fixed";

            const bounding = super.getBoundingClientRect();

            super.style.top        = "50%";
            super.style.left       = "50%";
            super.style.marginTop  = -(bounding.height / 2) + "px";
            super.style.marginLeft = -(bounding.width / 2) + "px";
        }
        else
        {
            super.style.position   = "relative";
            super.style.top        = "0";
            super.style.left       = "0";
            super.style.marginTop  = "0";
            super.style.marginLeft = "0";
        }
    }
}