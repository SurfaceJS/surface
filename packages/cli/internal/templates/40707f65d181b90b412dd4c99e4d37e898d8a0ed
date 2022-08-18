import HTMLXElement, { element, query } from "@surface/htmlx-element";
import template                         from "./index.htmlx";
import style                            from "./index.scss";

@element("app-image-pick", { template, style })
export default class ImagePick extends HTMLXElement
{
    public value = "";

    @query("#fileInput")
    public fileInput!: HTMLInputElement;

    public constructor()
    {
        super();

        this.fileInput.addEventListener("change", () => this.updateImage());
    }

    private updateImage(): void
    {
        const file = this.fileInput.files?.[0];

        if (file)
        {
            const fileReader = new FileReader();

            fileReader.readAsDataURL(file);
            fileReader.onload = event => this.value = event.target?.result as string;
        }
        else
        {
            this.value = "";
        }
    }
}