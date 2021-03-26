import CustomElement, { element } from "@surface/custom-element";
import template                   from "./index.html";
import style                      from "./index.scss";

@element("app-loading", template, style)
export default class Loading extends CustomElement
{
    private static active?: Loading;

    public static async show(): Promise<void>
    {
        if (!Loading.active)
        {
            Loading.active = document.body.appendChild(new Loading());
        }
    }

    public static close(): void
    {
        Loading.active?.remove();

        Loading.active = undefined;
    }
}