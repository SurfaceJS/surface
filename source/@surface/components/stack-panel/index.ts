import CustomElement from "@surface/custom-element";
import { element }   from "@surface/custom-element/decorators";
import template      from "./index.html";
import style         from "./index.scss";

@element("surface-stack-panel", template, style)
export class StackPanel extends CustomElement
{
    public get distribuition(): StackPanel.Distribuition
    {
        return StackPanel.Distribuition[super.getAttribute("distribuition") || ""] || StackPanel.Distribuition.None;
    }

    public set distribuition(value: StackPanel.Distribuition)
    {
        super.setAttribute("distribuition", StackPanel.Distribuition[value].toLowerCase());
    }

    public get orientation(): StackPanel.Orientation
    {
        return StackPanel.Orientation[super.getAttribute("orientation") || ""] || StackPanel.Orientation.Vertical;
    }

    public set orientation(value: StackPanel.Orientation)
    {
        super.setAttribute("orientation", StackPanel.Orientation[value].toLowerCase());
    }
}

export namespace StackPanel
{
    export enum Distribuition
    {
        None,
        Center,
        Justify
    }

    export enum Orientation
    {
        Vertical,
        Horizontal
    }
}

export default StackPanel;