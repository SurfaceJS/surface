import { Action }          from "@surface/core";
import ICustomElement      from "./interfaces/custom-element";
import StaticMetadata      from "./internal/metadata/static-metadata";
import References          from "./internal/references";
import { STATIC_METADATA } from "./internal/symbols";



export default class CustomElement extends HTMLElement implements ICustomElement
{
    private readonly _references: References;

    public get references(): References
    {
        return this._references;
    }

    public shadowRoot!: ShadowRoot;

    public onAfterBind?: Action;

    public constructor()
    {
        super();

        this.attachShadow({ mode: "open" });

        this.applyMetadata(this.shadowRoot);

        this._references = new References(this.shadowRoot);
    }

    private applyMetadata(shadowRoot: ShadowRoot): void
    {
        const metadata = (this.constructor as Function & { [STATIC_METADATA]?: StaticMetadata })[STATIC_METADATA];

        if (metadata?.styles)
        {
            // (shadowRoot as { adoptedStyleSheets?: Array<CSSStyleSheet> }).adoptedStyleSheets = metadata.styles;
        }

        if (metadata?.template)
        {
            const content = document.importNode(metadata.template.content, true);

            content.normalize();

            shadowRoot.appendChild(content);
        }
    }
}