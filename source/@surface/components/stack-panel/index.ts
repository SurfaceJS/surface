import { attribute, element } from "@surface/custom-element/decorators";
import Component              from "..";
import style                  from "./index.scss";

@element("surface-stack-panel", "", style)
export class StackPanel extends Component
{
    private _content:     StackPanel.Content     = StackPanel.Content.None;
    private _orientation: StackPanel.Orientation = StackPanel.Orientation.Vertical;

    @attribute
    public get content(): StackPanel.Content
    {
        return this._content;
    }

    public set content(value: StackPanel.Content)
    {
        this._content = value;
    }

    @attribute
    public get orientation(): StackPanel.Orientation
    {
        return this._orientation;
    }

    public set orientation(value: StackPanel.Orientation)
    {
        this._orientation = value;
    }
}

export namespace StackPanel
{
    export enum Content
    {
        None    = "",
        Center  = "center",
        Space   = "space",
        Justify = "justify"
    }

    export enum Orientation
    {
        Vertical   = "vertical",
        Horizontal = "horizontal",
    }
}

export default StackPanel;