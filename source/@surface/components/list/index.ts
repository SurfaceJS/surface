import Component              from "..";
import Enumerable             from "../../enumerable";
import { attribute, element } from "../decorators";
import template               from "./index.html";
import style                  from "./index.scss";
import ListItem               from "./list-item";

@element("surface-list", template, style)
export default class List extends Component
{
    private readonly template: HTMLTemplateElement;

    private readonly _items: Array<ListItem> = [];

    private _hideAddButton: boolean = false;

    @attribute
    public get hideAddButton(): boolean
    {
        return this._hideAddButton;
    }

    public set hideAddButton(value: boolean)
    {
        this._hideAddButton = value;
    }

    public get items(): Array<ListItem>
    {
        return this._items;
    }

    public constructor(template?: HTMLTemplateElement)
    {
        super();
        this.template = template || super.querySelector("template") || document.createElement("template");

        this.items.push(...Enumerable.from([...Array.from(super.querySelectorAll<ListItem>("surface-list-item"))]));
    }

    public add(node?: Node): void
    {
        const item = new ListItem(node || document.importNode(this.template.content, true));

        item.addEventListener("remove", () => this.remove(item));

        Component.contextBind({ ...super.context, list: this, item }, item);

        this.items.push(item);

        super.appendChild(item);

        super.dispatchEvent(new CustomEvent("add", { detail: item }));
    }

    public clear(): void
    {
        while (this.items.length > 0)
        {
            this.remove();
        }
    }

    public remove(): void;
    public remove(item: ListItem): void;
    public remove(item?: ListItem): void
    {
        if (this.items.length > 0)
        {
            super.dispatchEvent(new CustomEvent("remove", { detail: item }));

            if (item)
            {
                Component.contextUnbind(item);
                this.items.splice(this.items.indexOf(item), 1);
            }
            else
            {
                item = this.items.pop()!;
                Component.contextUnbind(item);
            }

            super.removeChild(item);
        }
    }
}