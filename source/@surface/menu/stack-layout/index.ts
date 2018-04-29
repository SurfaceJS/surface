import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-stack-layout", template, style)
export class StackLayout extends CustomElement
{
    public get align(): StackLayout.Align
    {
        return StackLayout.Align[super.getAttribute("align") || ""] || StackLayout.Align.Center;
    }

    public set align(value: StackLayout.Align)
    {
        super.setAttribute("align", value.toString());
    }
    public get orientation(): StackLayout.Orientation
    {
        return StackLayout.Orientation[super.getAttribute("orientation") || ""] || StackLayout.Orientation.Vertical;
    }

    public set orientation(value: StackLayout.Orientation)
    {
        super.setAttribute("orientation", StackLayout.Orientation[value].toLowerCase());
    }
}

export namespace StackLayout
{
    export enum Align
    {
        Center,
        End,
        Justify,
        Start
    }

    export enum Orientation
    {
        Vertical,
        Horizontal
    }
}

export default StackLayout;