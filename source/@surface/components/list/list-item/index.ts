import Component   from "../..";
import { element } from "../../decorators";
import template    from "./index.html";
import style       from "./index.scss";

@element("surface-list-item", template, style)
export default class ListItem extends Component
{
    public constructor(node?: Node)
    {
        super();

        if (node)
        {
            this.appendChild(node);
        }
    }

    protected fireRemove(): void
    {
        this.dispatchEvent(new CustomEvent("remove", { detail: this }));
    }
}