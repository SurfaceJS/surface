import Component   from "..";
import { element } from "../decorators";
import template    from "./index.html";
import style       from "./index.scss";
import ListItem    from "./list-item";

@element("surface-list", template, style)
export default class List extends Component
{
    private readonly template: HTMLTemplateElement;

    private readonly _items: Array<ListItem> = [];

    public get items(): Array<ListItem>
    {
        return this._items;
    }

    public constructor();
    public constructor(template: HTMLTemplateElement);
    public constructor(template?: HTMLTemplateElement)
    {
        super();
        this.template = template || super.query("template") || document.createElement("template");
        this.items.push(...super.queryAll("surface-list-item").cast<ListItem>().toArray());
    }

    public add(): void
    {
        const item = new ListItem(document.importNode(this.template.content, true));

        item.addEventListener("remove", () => this.remove(item));

        Component.contextBind({ ...super.context, list: this, item }, item);

        this.items.push(item);

        super.appendChild(item);

        super.dispatchEvent(new CustomEvent("add", { detail: item }));
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
                Component.contextUnbind(this.items.pop()!);
            }

            super.removeChild(item);
        }
    }
}