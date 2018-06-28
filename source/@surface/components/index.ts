import { dashedToCamel, toTitle } from "@surface/core/common/string";
import CustomElement              from "@surface/custom-element";

abstract class Component extends CustomElement
{
    public get horizontalAlign(): Component.HorizontalAlign
    {
        return Component.VerticalAlign[toTitle(super.getAttribute("horizontal-align") || "")] || Component.HorizontalAlign.Left;
    }

    public set horizontalAlign(value: Component.HorizontalAlign)
    {
        super.setAttribute("horizontal-align", dashedToCamel(Component.HorizontalAlign[value]));
    }

    public get verticalAlign(): Component.VerticalAlign
    {
        return Component.VerticalAlign[toTitle(super.getAttribute("vertical-align") || "")] || Component.VerticalAlign.Top;
    }

    public set verticalAlign(value: Component.VerticalAlign)
    {
        super.setAttribute("vertical-align", dashedToCamel(Component.VerticalAlign[value]));
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