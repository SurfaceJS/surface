import HTMLXElement, { computed, element, event } from "@surface/htmlx-element";
import template                                   from "./index.htmlx";
import style                                      from "./index.scss";

@element("app-input", { template, style })
export default class Input extends HTMLXElement
{
    private cache = "";

    public isEditing = false;
    public value     = "";

    @computed("isEditing")
    public get classes(): Record<string, boolean>
    {
        return {
            "is-editing": this.isEditing,
        }
    }

    @event("keypress")
    @event("keyup")
    @event("keydown")
    public keyPressHandler(event: KeyboardEvent): void
    {
        if (event.key == "Enter")
        {
            this.save();
        }
        else if (event.key == "Tab" || event.key == "Escape")
        {
            this.close();

            event.preventDefault();
        }
    }

    public edit(): void
    {
        this.cache     = this.value;
        this.isEditing = true;
    }

    public close(): void
    {
        this.value     = this.cache;
        this.isEditing = false;
    }

    public save(): void
    {
        if (this.value != this.cache)
        {
            this.dispatchEvent(new Event("change"));
        }

        this.cache     = "";
        this.isEditing = false;
    }
}