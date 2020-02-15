import { Action, Indexer }                     from "@surface/core";
import ICustomElement                          from "./interfaces/custom-element";
import References                              from "./internal/references";
import { SCOPE, SHADOW_ROOT, STATIC_METADATA } from "./internal/symbols";
import { StaticMetadata }                      from "./internal/types";

type Scope = Indexer & { host?: HTMLElement };

export default class CustomElement extends HTMLElement implements ICustomElement
{
    private readonly _references: References;

    protected readonly [SHADOW_ROOT]: ShadowRoot;

    protected [SCOPE]: Scope = { };

    public onAfterBind?: Action;

    protected get scope(): Scope
    {
        return this[SCOPE];
    }

    public get references(): References
    {
        return this._references;
    }

    public constructor()
    {
        super();

        const shadowRoot = this[SHADOW_ROOT] = this.attachShadow({ mode: "closed" });

        this.applyMetadata(shadowRoot);

        this._references = new References(shadowRoot);
    }

    private applyMetadata(shadowRoot: ShadowRoot): void
    {
        const metadata = (this.constructor as Function & { [STATIC_METADATA]?: StaticMetadata })[STATIC_METADATA];

        if (metadata?.styles)
        {
            (shadowRoot as { adoptedStyleSheets?: Array<CSSStyleSheet> }).adoptedStyleSheets = metadata.styles;
        }

        if (metadata?.template)
        {
            const content = document.importNode(metadata.template.content, true);

            content.normalize();

            shadowRoot.appendChild(content);
        }
    }
}