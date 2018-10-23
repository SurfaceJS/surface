import { Nullable }           from "@surface/core";
import ResizeObserver         from "resize-observer-polyfill";
import Component              from "..";
import { attribute, element } from "../decorators";
import template               from "./index.html";
import style                  from "./index.scss";

export type StartPosition = "center-screen"|"center-parent"|"manual"|"none";

@element("surface-modal", template, style)
export default class Modal extends Component
{
    private readonly observer: ResizeObserver;

    private _x: number = 0;
    private _y: number = 0;

    private _startPosition: StartPosition = "none";

    @attribute
    public get startPosition(): StartPosition
    {
        return this._startPosition;
    }

    public set startPosition(value: StartPosition)
    {
        this._startPosition = value;
    }

    public set visible(value: boolean)
    {
        if (value)
        {
            this.show();
        }
        else
        {
            this.hide();
        }
    }

    public get x(): number
    {
        return this._x || super.x;
    }

    public set x(value: number)
    {
        this._x = value;
        super.x = value;
    }

    public get y(): number
    {
        return this._y || super.y;
    }

    public set y(value: number)
    {
        this._y = value;
        super.y = value;
    }

    public constructor(template?: HTMLTemplateElement)
    {
        super();

        if (template)
        {
            super.appendChild(document.importNode(template.content, true));
        }

        this.visible = false;
        this.observer = new ResizeObserver(x => super.visible && this.update()); //this.visible && this.update());
        this.observer.observe(this);
    }

    private update(): void
    {
        super.style.position = this.startPosition == "none" ?
            "relative"
            : this.startPosition == "center-screen" ?
                "fixed"
                : "absolute";

        if (this.startPosition == "center-screen" || this.startPosition == "center-parent")
        {
            const bounding = super.getBoundingClientRect();

            super.style.top        = "50%";
            super.style.left       = "50%";
            super.style.marginTop  = -(bounding.height / 2) + "px";
            super.style.marginLeft = -(bounding.width / 2) + "px";
        }
        else if (this.startPosition != "none")
        {
            const bounding = super.getBoundingClientRect();

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

            const left = /*Number.parseFloat(super.style.left || "0")*/ this.x + offset.horizontal[this.horizontalAlign];
            const top  = /*Number.parseFloat(super.style.top  || "0")*/ this.y + offset.vertical[this.verticalAlign];

            super.style.left = `${(left > 0 ? left < window.outerWidth  - bounding.width  ? left : window.outerWidth  - bounding.width  : 0)}px`;
            super.style.top  = `${(top  > 0 ? top  < window.innerHeight - bounding.height ? top  : window.innerHeight - bounding.height : 0)}px`;
        }
    }

    protected attributeChangedCallback(name: "start-position", _: Nullable<string>, newValue: string)
    {
        const value = (["center-screen", "center-parent", "manual", "none"].includes(newValue) ? newValue : "none") as StartPosition;

        if (value != this.startPosition)
        {
            this.startPosition = value;
        }
    }

    public hide()
    {
        super.visible = false;

        if (this.parentNode == document.body)
        {
            document.body.removeChild(this);
        }
    }

    public show()
    {
        if (!this.parentNode)
        {
            document.body.appendChild(this);
        }

        super.visible = true;

        this.update();
    }
}