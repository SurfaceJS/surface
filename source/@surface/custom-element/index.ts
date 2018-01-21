import "./extensions";
import "@surface/collection/extensions";
import "@surface/enumerable/extensions";

import * as symbols from "./symbols";
import DataBind     from "./internal/data-bind";

import { List } from "@surface/collection";

const shadowRoot = Symbol.for("shadowRoot");

export default abstract class CustomElement extends HTMLElement
{
    /* Todo: Waiting support
    public static readonly [symbols.observedAttributes]: Nullable<Array<string>>;
    public static readonly [symbols.template]:           Nullable<HTMLTemplateElement>;

    private readonly [shadowRoot]: ShadowRoot;

    public [symbols.onAttributeChanged]: (attributeName: string, oldValue: string, newValue: string, namespace: string) => void;
    */

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

        this.applyTemplate(this.constructor[symbols.template]);
    }

    private applyTemplate(template: HTMLTemplateElement): void
    {
        let content = document.importNode(template.content, true);

        DataBind.for(this, content);

        this[shadowRoot].appendChild(content);
    }

    /**
     * Called when an attribute is changed, appended, removed, or replaced on the element.
     * Only called for observed attributes.
     */
    protected attributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void
    {
        if (this[symbols.onAttributeChanged])
        {
            this[symbols.onAttributeChanged](attributeName, oldValue, newValue, namespace);
        }
    }

    /**
     * Returns the first element that matches the specified selector.
     * @param selector Query selector.
     */
    public get<T extends HTMLElement>(selector: string): T;
    /**
     * Returns the first element that matches the specified pattern.
     * @param selector Query pattern.
     */
    public get<T extends HTMLElement>(selector: RegExp): T;
    /**
     * Returns the first element that matches the specified name at the specified slot.
     * @param selector Query selector.
     * @param slotName Slot name.
     */
    public get<T extends HTMLElement>(selector: string, slotName: string): T;
    /**
     * Returns the first element that matches the specified pattern at the specified slot.
     * @param selector Query pattern.
     * @param slotName Slot name.
     */
    public get<T extends HTMLElement>(selector: RegExp, slotName: string): T;
    public get<T extends HTMLElement>(selector: string|RegExp, slotName?: string): T
    {
        // tslint:disable-next-line:no-any
        return this.getAll<T>(selector as any, slotName as any).first();
    }

    /**
     * Returns the all elements that matches the specified name.
     * @param selector Query selector.
     */
    public getAll<T extends HTMLElement>(selector: string): List<T>;
    /**
     * Returns the all elements that matches the specified pattern.
     * @param selector Query pattern.
     */
    public getAll<T extends HTMLElement>(selector: RegExp): List<T>;
    /**
     * Returns the all elements that matches the specified name at the specified slot.
     * @param selector Query selector.
     * @param slotName Slot name.
     */
    public getAll<T extends HTMLElement>(selector: string, slotName: string): List<T>;
    /**
     * Returns the all elements that matches the specified pattern at the specified slot.
     * @param selector Query pattern.
     * @param slotName Slot name.
     */
    public getAll<T extends HTMLElement>(selector: RegExp, slotName: string): List<T>;
    public getAll<T extends HTMLElement>(selector: string|RegExp, slotName?: string): List<T>
    {
        const root: ShadowRoot = this[shadowRoot];
        let slots = root
            .querySelectorAll(slotName ? `slot[name="${slotName}"]` : "slot");

        if (slots.length > 0)
        {
            return slots.asEnumerable()
                .cast<HTMLSlotElement>()
                .select
                (
                    slot => slot.assignedNodes()
                        .asEnumerable()
                        .cast<HTMLElement>()
                        .where(x => x.nodeType != Node.TEXT_NODE)
                        .where
                        (
                            x => selector instanceof RegExp ?
                                !!x.tagName.toLowerCase().match(selector) :
                                x.tagName.toLowerCase() == selector.toLowerCase()
                        )
                        .toArray()
                )
                .selectMany(x => x)
                .cast<T>()
                .toList();
        }
        else if (selector instanceof RegExp)
        {
            return root.querySelectorAll("*")
                .asEnumerable()
                .cast<HTMLElement>()
                .where(x => !!x.tagName.toLowerCase().match(selector))
                .cast<T>()
                .toList();
        }
        else
        {
            return root.querySelectorAll(selector).asEnumerable().cast<T>().toList();
        }
    }
}