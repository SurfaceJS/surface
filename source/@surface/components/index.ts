import { toTitle }       from "@surface/core/common/string";
import CustomElement     from "@surface/custom-element";

abstract class Component extends CustomElement
{
    private storedDisplay: string|null = null;

    public get disabled(): boolean
    {
        return super.getAttribute("disabled") == "true";
    }

    public set disabled(value: boolean)
    {
        super.setAttribute("disabled", value.toString());
    }

    public get horizontalAlign(): Component.HorizontalAlign
    {
        return Component.HorizontalAlign[toTitle(super.getAttribute("horizontal-align") || "") as keyof typeof Component.HorizontalAlign] || Component.HorizontalAlign.Left;
    }

    public set horizontalAlign(value: Component.HorizontalAlign)
    {
        super.setAttribute("horizontal-align", value);
    }

    public get verticalAlign(): Component.VerticalAlign
    {
        return Component.VerticalAlign[toTitle(super.getAttribute("vertical-align") || "") as keyof typeof Component.VerticalAlign] || Component.VerticalAlign.Top;
    }

    public set verticalAlign(value: Component.VerticalAlign)
    {
        super.setAttribute("vertical-align", value);
    }

    public get visible(): boolean
    {
        return super.style.display != "none";
    }

    public set visible(value: boolean)
    {
        if (!value && this.style.display != "none")
        {
            this.storedDisplay = super.style.display;
            this.style.display = "none";
        }
        else if (value && this.style.display == "none")
        {
            super.style.display = this.storedDisplay;
        }
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