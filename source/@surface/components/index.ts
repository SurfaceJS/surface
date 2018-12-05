import CustomElement from "@surface/custom-element";
import { attribute } from "./decorators";

abstract class Component extends CustomElement
{
    private storedDisplay: string|null = null;

    private _horizontalAlign: Component.HorizontalAlign = Component.HorizontalAlign.Left;
    private _verticalAlign:   Component.VerticalAlign   = Component.VerticalAlign.Top;

    public get disabled(): boolean
    {
        return super.getAttribute("disabled") == "true";
    }

    public set disabled(value: boolean)
    {
        super.setAttribute("disabled", value.toString());
    }

    public get height(): number
    {
        return super.getBoundingClientRect().height;
    }

    @attribute
    public get horizontalAlign(): Component.HorizontalAlign
    {
        return this._horizontalAlign;
    }

    public set horizontalAlign(value: Component.HorizontalAlign)
    {
        this._horizontalAlign = value;
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
                return super.parentElement ?
                    super.getBoundingClientRect().left - super.parentElement.getBoundingClientRect().left
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
                return super.parentElement ?
                    super.getBoundingClientRect().top - super.parentElement.getBoundingClientRect().top
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
    public get verticalAlign(): Component.VerticalAlign
    {
        return this._verticalAlign;
    }

    public set verticalAlign(value: Component.VerticalAlign)
    {
        this._verticalAlign = value;
    }

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
            super.style.display = this.storedDisplay;
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