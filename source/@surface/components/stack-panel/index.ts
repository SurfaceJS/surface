import { dashedToCamel, toTitle } from "@surface/core/common/string";
import Component                  from "..";
import { element }                from "../decorators";
import template                   from "./index.html";
import style                      from "./index.scss";

@element("surface-stack-panel", template, style)
export class StackPanel extends Component
{
    public get distribuition(): StackPanel.Distribuition
    {
        return StackPanel.Distribuition[toTitle(super.getAttribute("distribuition") || "") as keyof typeof StackPanel.Distribuition] || StackPanel.Distribuition.None;
    }

    public set distribuition(value: StackPanel.Distribuition)
    {
        super.setAttribute("distribuition", dashedToCamel(StackPanel.Distribuition[value].toLowerCase()));
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