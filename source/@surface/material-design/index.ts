import CustomElement                 from "@surface/custom-element";
import { attribute, notify, styles } from "@surface/custom-element/decorators";
import style                         from "./index.scss";

@styles(style)
class Component extends CustomElement
{
    @attribute
    @notify("classes")
    public dark: boolean = false;

    @attribute
    public disabled: boolean = false;

    @attribute
    @notify("classes")
    public elevation: number = 0;

    @attribute
    public horizontalAlign: Component.HorizontalAlign = Component.HorizontalAlign.Left;

    @attribute
    @notify("classes")
    public light: boolean = false;

    @attribute
    public verticalAlign: Component.VerticalAlign = Component.VerticalAlign.Top;

    public get classes(): Record<string, boolean>
    {
        return {
            dark:                            this.dark,
            light:                           this.light,
            [`elevation-${this.elevation}`]: this.elevation > -1 && this.elevation < 25
        };
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