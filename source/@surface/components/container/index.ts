import { dashedToCamel } from "@surface/core/common/string";
import CustomElement     from "@surface/custom-element";
import { element }       from "../decorators";
import template          from "./index.html";
import style             from "./index.scss";

@element("surface-container", template, style)
export class Container extends CustomElement
{
    public get position(): Container.Position
    {
        return Container.Position[dashedToCamel(super.getAttribute("position") || "") as keyof typeof Container.Position] || Container.Position.Center;
    }

    public set position(value: Container.Position)
    {
        super.setAttribute("position", value.toString());
    }
}

export namespace Container
{
    export enum Position
    {
        Center,
        Top,
        TopRight,
        Right,
        BottomRight,
        Bottom,
        BottomLeft,
        Left,
        TopLeft
    }
}

export default Container;