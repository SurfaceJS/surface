import { dashedToCamel, toTitle } from "@surface/core/common/string";
import CustomElement              from "@surface/custom-element";

abstract class Component extends CustomElement
{
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
        super.setAttribute("horizontal-align", dashedToCamel(Component.HorizontalAlign[value as string as keyof typeof Component.HorizontalAlign]));
    }

    public get verticalAlign(): Component.VerticalAlign
    {
        return Component.VerticalAlign[toTitle(super.getAttribute("vertical-align") || "") as keyof typeof Component.VerticalAlign] || Component.VerticalAlign.Top;
    }

    public set verticalAlign(value: Component.VerticalAlign)
    {
        super.setAttribute("vertical-align", dashedToCamel(Component.VerticalAlign[value as string as keyof typeof Component.VerticalAlign]));
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