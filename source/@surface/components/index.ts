import CustomElement          from "@surface/custom-element";
import { attribute,  styles } from "@surface/custom-element/decorators";
import style                  from "./index.scss";

@styles(style)
class Component extends CustomElement
{
    private storedDisplay: string | null = null;

    @attribute
    public disabled: boolean = false;

    @attribute
    public elevation: number = 0;

    @attribute
    public horizontalAlign: Component.HorizontalAlign = Component.HorizontalAlign.Left;

    @attribute
    public verticalAlign: Component.VerticalAlign = Component.VerticalAlign.Top;

    public get classes(): Record<string, boolean>
    {
        return { [`elevation-${this.elevation}`]: this.elevation > -1 && this.elevation < 25 };
    }

    public get height(): number
    {
        return super.getBoundingClientRect().height;
    }

    public get left(): number
    {
        switch (super.style.position)
        {
            case "absolute":
                return super.offsetLeft;
            case "fixed":
                return super.getBoundingClientRect().left;
            default:
                return super.parentElement
                    ? super.getBoundingClientRect().left - super.parentElement.getBoundingClientRect().left
                    : super.getBoundingClientRect().left;
        }
    }

    public set left(value: number)
    {
        if (!super.style.position)
        {
            super.style.position = "relative";
        }

        super.style.left = `${value}px`;
    }

    public get top(): number
    {
        switch (super.style.position)
        {
            case "absolute":
                return super.offsetTop;
            case "fixed":
                return super.getBoundingClientRect().top;
            default:
                return super.parentElement
                    ? super.getBoundingClientRect().top - super.parentElement.getBoundingClientRect().top
                    : super.getBoundingClientRect().top;
        }
    }

    public set top(value: number)
    {
        if (!super.style.position)
        {
            super.style.position = "relative";
        }

        super.style.top = `${value}px`;
    }

    @attribute
    public get visible(): boolean
    {
        return super.style.display != "none";
    }

    public set visible(value: boolean)
    {
        if (!value && super.style.display != "none")
        {
            this.storedDisplay = super.style.display;

            super.style.display = "none";
        }
        else if (value && super.style.display == "none")
        {
            super.style.display = this.storedDisplay ?? "";
        }
    }

    public get width(): number
    {
        return super.getBoundingClientRect().width;
    }
}

namespace Component
{
    export enum HorizontalAlign
    {
        Center = "center",
        Left   = "left",
        Right  = "right"
    }

    export enum VerticalAlign
    {
        Bottom = "bottom",
        Center = "center",
        Top    = "top",
    }
}

export default Component;