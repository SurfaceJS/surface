import { dashedToCamel, toTitle } from "@surface/core/common/string";
import CustomElement              from "@surface/custom-element";

export abstract class Component extends CustomElement
{
    public get horizontalAlignment(): Component.HorizontalAlignment
    {
        return Component.VerticalAlignment[toTitle(super.getAttribute("horizontalAlignment") || "")] || Component.HorizontalAlignment.Left;
    }

    public set horizontalAlignment(value: Component.HorizontalAlignment)
    {
        super.setAttribute("horizontalAlignment", dashedToCamel(Component.HorizontalAlignment[value]));
    }

    public get verticalAlignment(): Component.VerticalAlignment
    {
        return Component.VerticalAlignment[toTitle(super.getAttribute("verticalAlignment") || "")] || Component.VerticalAlignment.Top;
    }

    public set verticalAlignment(value: Component.VerticalAlignment)
    {
        super.setAttribute("verticalAlignment", dashedToCamel(Component.VerticalAlignment[value]));
    }
}

export namespace Component
{
    export enum HorizontalAlignment
    {
        Center = "center",
        Left   = "left",
        Right  = "right"
    }

    export enum VerticalAlignment
    {
        Bottom = "bottom",
        Center = "center",
        Top    = "top",
    }
}

export default Component;