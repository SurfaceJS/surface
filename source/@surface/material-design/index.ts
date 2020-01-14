import CustomElement                 from "@surface/custom-element";
import { attribute, notify, styles } from "@surface/custom-element/decorators";
import style                         from "./index.scss";

@styles(style)
class Component extends CustomElement
{
    @attribute
    public disabled: boolean = false;

    @attribute
    @notify("classes")
    public elevation: number = 0;

    @attribute
    public horizontalAlign: Component.HorizontalAlign = Component.HorizontalAlign.Left;

    @attribute
    public verticalAlign: Component.VerticalAlign = Component.VerticalAlign.Top;

    public get classes(): Record<string, boolean>
    {
        return { [`elevation-${this.elevation}`]: this.elevation > -1 && this.elevation < 25 };
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