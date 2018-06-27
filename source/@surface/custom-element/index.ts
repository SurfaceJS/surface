import { Action, Nullable }                                  from "@surface/core";
import Enumerable                                            from "@surface/enumerable";
import ElementBind                                           from "./internal/element-bind";
import { context, observedAttributes, shadowRoot, template } from "./internal/symbols";

export default abstract class CustomElement extends HTMLElement
{
    public static readonly [observedAttributes]: Nullable<Array<string>>;
    public static readonly [template]:           Nullable<HTMLTemplateElement>;

    private [context]: Nullable<Object>;
    protected get context(): Object
    {
        return this[context] || { };
    }

    private readonly [shadowRoot]: ShadowRoot;

    public onAfterBind?: Action;

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

        if (this.constructor[template])
        {
            this.applyTemplate(this.constructor[template]);
        }
    }
    protected static contextBind(context: Object, content: Node): void
    {
        ElementBind.for(context, content);
    }

    private applyTemplate(template: HTMLTemplateElement): void
    {
        const content = document.importNode(template.content, true);

        this[shadowRoot].appendChild(content);
    }

    /**
     * Returns the first element that matches the specified selector on element shadowRoot
     * @param selector Query selector
     */
    protected shadowQuery<T extends HTMLElement>(selector: string): Nullable<T>
    {
        return this[shadowRoot].querySelector(selector) as Nullable<T>;
    }

    /**
     * Returns an enumerable from the all elements that matches the specified name on element shadowRoot
     * @param selector Query selector
     */
    protected shadowQueryAll<T extends HTMLElement>(selector: string): Enumerable<T>
    {
        return Enumerable.from((Array.from(this[shadowRoot].querySelectorAll(selector))));
    }

    /**
     * Returns the first element that matches the specified selector
     * @param selector Query selector
     */
    public query<T extends HTMLElement>(selector: string): Nullable<T>
    {
        return this.querySelector(selector) as Nullable<T>;
    }

    /**
     * Returns an enumerable from the all elements that matches the specified name
     * @param selector Query selector
     */
    public queryAll<T extends HTMLElement>(selector: string): Enumerable<T>
    {
        return Enumerable.from((Array.from(super.querySelectorAll(selector))));
    }
}