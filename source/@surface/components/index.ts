import CustomElement from "@surface/custom-element";
import { attribute } from "./decorators";

abstract class Component extends CustomElement
{
    private storedDisplay: string|null = null;

    private _disabled:        boolean                   = false;
    private _horizontalAlign: Component.HorizontalAlign = Component.HorizontalAlign.Left;
    private _verticalAlign:   Component.VerticalAlign   = Component.VerticalAlign.Top;

    @attribute
    public get disabled(): boolean
    {
        return this._disabled;
    }

    public set disabled(value: boolean)
    {
        this._disabled = value;
    }

    public get height(): number
    {
        return this.getBoundingClientRect().height;
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
        switch (this.style.position)
        {
            case "absolute":
                return this.offsetLeft;
            case "fixed":
                return this.getBoundingClientRect().left;
            default:
                return this.parentElement ?
                    this.getBoundingClientRect().left - this.parentElement.getBoundingClientRect().left
                    : this.getBoundingClientRect().left;
        }
    }

    public set left(value: number)
    {
        if (!this.style.position)
        {
            this.style.position = "relative";
        }

        this.style.left = `${value}px`;
    }

    public get top(): number
    {
        switch (this.style.position)
        {
            case "absolute":
                return this.offsetTop;
            case "fixed":
                return this.getBoundingClientRect().top;
            default:
                return this.parentElement ?
                    this.getBoundingClientRect().top - this.parentElement.getBoundingClientRect().top
                    : this.getBoundingClientRect().top;
        }
    }

    public set top(value: number)
    {
        if (!this.style.position)
        {
            this.style.position = "relative";
        }

        this.style.top = `${value}px`;
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
        return this.style.display != "none";
    }

    public set visible(value: boolean)
    {
        if (!value && this.style.display != "none")
        {
            this.storedDisplay = this.style.display;
            this.style.display = "none";
        }
        else if (value && this.style.display == "none")
        {
            this.style.display = this.storedDisplay ?? "";
        }
    }

    public get width(): number
    {
        return this.getBoundingClientRect().width;
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