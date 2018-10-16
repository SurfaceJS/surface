import { Action, Nullable }                                  from "@surface/core";
import Enumerable                                            from "@surface/enumerable";
import ElementBind                                           from "./internal/element-bind";
import { CONTEXT, OBSERVED_ATTRIBUTES, SHADOW_ROOT, TEMPLATE } from "./internal/symbols";
import Observer from '../observer';

export default abstract class CustomElement extends HTMLElement
{
    public static readonly [OBSERVED_ATTRIBUTES]: Nullable<Array<string>>;
    public static readonly [TEMPLATE]:            Nullable<HTMLTemplateElement>;

    private [CONTEXT]: unknown;
    protected get context(): object
    {
        return (this[CONTEXT] || { }) as object;
    }

    private readonly [SHADOW_ROOT]: ShadowRoot;

    public bindedCallback?: Action;

    protected constructor();
    protected constructor(shadowRootInit: ShadowRootInit);
    protected constructor(shadowRootInit?: ShadowRootInit)
    {
        super();
        this[SHADOW_ROOT] = this.attachShadow(shadowRootInit || { mode: "closed" });

        if (window.ShadyCSS)
        {
            window.ShadyCSS.styleElement(this);
        }

        const template = (this.constructor as typeof CustomElement)[TEMPLATE];

        if (template)
        {
            this.applyTemplate(template);
        }
    }

    /**
     * Apply binds to node tree
     * @param context Context utilized to resolve expressions
     * @param content Node tree to be binded
     */
    protected static contextBind(context: object, content: Node): void
    {
        ElementBind.for(context, content);
    }

    /**
     * Remove binds reference of node tree.
     * @param content Node tree to be unbinded
     */
    protected static contextUnbind(content: Node): void
    {
        ElementBind.unbind(content);
    }

    private applyTemplate(template: HTMLTemplateElement): void
    {
        const content = document.importNode(template.content, true);

        this[SHADOW_ROOT].appendChild(content);
    }

    protected notify<K extends keyof this>(key: K)
    {
        Observer.notify(this, key);
    }

    /**
     * Returns the first element that matches the specified selector on element shadowRoot
     * @param selector Query selector
     */
    protected shadowQuery<T extends HTMLElement>(selector: string): Nullable<T>
    {
        return this[SHADOW_ROOT].querySelector(selector) as Nullable<T>;
    }

    /**
     * Returns an enumerable from the all elements that matches the specified name on element shadowRoot
     * @param selector Query selector
     */
    protected shadowQueryAll<T extends HTMLElement>(selector: string): Enumerable<T>
    {
        return Enumerable.from((Array.from(this[SHADOW_ROOT].querySelectorAll(selector))));
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