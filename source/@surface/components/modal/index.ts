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
    private _left: number = 0;
    private _top:  number = 0;

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

    @attribute
    public get horizontalAlign(): Component.HorizontalAlign
    {
        return super.horizontalAlign;
    }

    public set horizontalAlign(value: Component.HorizontalAlign)
    {
        super.horizontalAlign = value;
    }

    public get left(): number
    {
        return this._left || super.left;
    }

    public set left(value: number)
    {
        this._left = value;
        super.left = value;
    }

    public get top(): number
    {
        return this._top || super.top;
    }

    public set top(value: number)
    {
        this._top = value;
        super.top = value;
    }

    @attribute
    public get verticalAlign(): Component.VerticalAlign
    {
        return super.verticalAlign;
    }

    public set verticalAlign(value: Component.VerticalAlign)
    {
        super.verticalAlign = value;
    }

    public get visible(): boolean
    {
        return super.visible;
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

    public constructor(template?: HTMLTemplateElement)
    {
        super();

        if (template)
        {
            super.appendChild(document.importNode(template.content, true));
        }

        this.horizontalAlign = Component.HorizontalAlign.Center;
        this.verticalAlign   = Component.VerticalAlign.Center;

        this.visible = false;
        new ResizeObserver(() => super.visible && this.refresh()).observe(this);
    }

    private refresh(): void
    {
        super.style.position = this.startPosition == "none" ?
            "relative"
            : this.startPosition == "center-screen" ?
                "fixed"
                : "absolute";

        if (this.startPosition == "center-screen" || this.startPosition == "center-parent")
        {
            const bounding = super.getBoundingClientRect();

            switch (super.horizontalAlign)
            {
                case Component.HorizontalAlign.Left:
                    super.left = 0;
                    break;
                case Component.HorizontalAlign.Center:
                default:
                    super.style.left = `calc(50% - ${bounding.width / 2}px)`;
                    break;
                case Component.HorizontalAlign.Right:
                    super.style.left = `calc(100% - ${bounding.width}px)`;
                    break;
            }

            switch (super.verticalAlign)
            {
                case Component.VerticalAlign.Top:
                    super.top = 0;
                    break;
                case Component.VerticalAlign.Center:
                default:
                    super.style.top = `calc(50% - ${bounding.height / 2}px)`;
                    break;
                case Component.VerticalAlign.Bottom:
                    super.style.top = `calc(100% - ${bounding.height}px)`;
                    break;
            }
        }
        else if (this.startPosition != "none")
        {
            super.style.left = "0";
            super.style.top  = "0";
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

            const left = this.left + offset.horizontal[super.horizontalAlign];
            const top  = this.top  + offset.vertical[super.verticalAlign]    ;

            super.style.left = `${(left > 0 ? left <= window.innerWidth  - bounding.width  ? left : window.innerWidth  - bounding.width  : 0) + window.scrollX}px`;
            super.style.top  = `${(top  > 0 ? top  <= window.innerHeight - bounding.height ? top  : window.innerHeight - bounding.height : 0) + window.scrollY}px`;
        }
    }

    protected attributeChangedCallback(name: "start-position"|"horizontal-align"|"vertical-align", _: Nullable<string>, newValue: string)
    {
        const value = (["center-screen", "center-parent", "manual", "none"].includes(newValue) ? newValue : "none") as StartPosition;

        if (name == "start-position" && value != this.startPosition)
        {
            this.startPosition = value;
        }

        if (this.visible)
        {
            this.refresh();
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

        this.refresh();
    }
}