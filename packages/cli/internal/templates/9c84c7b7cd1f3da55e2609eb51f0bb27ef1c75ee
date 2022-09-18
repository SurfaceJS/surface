import HTMLXElement, { element } from "@surface/htmlx-element";
import template                  from "./index.htmlx";
import style                     from "./index.scss";

@element("app-message-dialog", { template, style })
export default class MessageDialog extends HTMLXElement
{
    public message = "";
    public title   = "";

    public static async show(title: string, message: string): Promise<void>
    {
        const dialog = document.body.appendChild(new MessageDialog());

        dialog.message = message;
        dialog.title   = title;

        await new Promise<void>
        (
            resolve =>
            {
                const action = (): void => (resolve(), dialog.removeEventListener("close", action));

                dialog.addEventListener("close", action);
            }
        );
    }

    public close(): void
    {
        this.dispatchEvent(new Event("close"));

        this.remove();
    }
}