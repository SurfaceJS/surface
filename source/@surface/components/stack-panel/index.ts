import { dashedToCamel, toTitle } from "@surface/core/common/string";
import Component                  from "..";
import { element }                from "../decorators";
import template                   from "./index.html";
import style                      from "./index.scss";

@element("surface-stack-panel", template, style)
export class StackPanel extends Component
{
    public get content(): StackPanel.Content
    {
        return StackPanel.Content[toTitle(super.getAttribute("content") || "") as keyof typeof StackPanel.Content] || StackPanel.Content.None;
    }

    public set content(value: StackPanel.Content)
    {
        super.setAttribute("content", dashedToCamel(StackPanel.Content[value].toLowerCase()));
    }

    public get orientation(): StackPanel.Orientation
    {
        return StackPanel.Orientation[toTitle(super.getAttribute("orientation") || "") as keyof typeof StackPanel.Orientation] || StackPanel.Orientation.Vertical;
    }

    public set orientation(value: StackPanel.Orientation)
    {
        super.setAttribute("orientation", dashedToCamel(StackPanel.Orientation[value]));
    }
}

export namespace StackPanel
{
    export enum Content
    {
        None,
        Center,
        Space,
        Justify
    }

    export enum Orientation
    {
        Vertical,
        Horizontal
    }
}

export default StackPanel;