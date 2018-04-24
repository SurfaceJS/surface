import "@surface/collection/extensions";
import "@surface/enumerable/extensions";
import "./extensions";

import List         from "@surface/collection/list";
import { Nullable } from "@surface/core";
import ElementBind  from "./internal/element-bind";
import * as symbols from "./internal/symbols";

const shadowRoot = Symbol("custom-element:shadowRoot");

export default abstract class CustomElement extends HTMLElement
{
    public static readonly [symbols.observedAttributes]: Nullable<Array<string>>;
    public static readonly [symbols.template]:           Nullable<HTMLTemplateElement>;

    private readonly [shadowRoot]: ShadowRoot;

    protected constructor();
    protected constructor(shadowRootInit: ShadowRootInit);
    protected constructor(shadowRootInit?: ShadowRootInit)
    {
        super();
        this[shadowRoot] = this.attachShadow(shadowRootInit || { mode: "closed" });

        if (window.ShadyCSS)
        {
            window.ShadyCSS.styleElement(this);
        }

        if (this.constructor[symbols.template])
        {
            this.applyTemplate(this.constructor[symbols.template]);
        }
    }

    private applyTemplate(template: HTMLTemplateElement): void
    {
        let content = document.importNode(template.content, true);

        this[shadowRoot].appendChild(content);

        ElementBind.for(this, this[shadowRoot]);
    }

    /**
     * Returns the first element that matches the specified selector.
     * @param selector Query selector.
     */
    public find<T extends HTMLElement>(selector: string): T
    {
        return this[shadowRoot].querySelector(selector) as T;
    }

    /**
     * Returns the all elements that matches the specified name.
     * @param selector Query selector.
     */
    public findAll<T extends HTMLElement>(selector: string): List<T>
    {
        return this[shadowRoot].querySelectorAll(selector).asEnumerable().cast<T>().toList();
    }
}