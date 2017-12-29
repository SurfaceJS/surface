import "./extensions";
import "@surface/collection/extensions";
import "@surface/enumerable/extensions";

import { DataBind } from "./data-bind";
import * as symbols from "./symbols";

import { List }     from "@surface/collection";
import { Nullable } from "@surface/types";

const shadowRoot = Symbol.for("shadowRoot");

export abstract class CustomElement extends HTMLElement
{
    public static readonly [symbols.observedAttributes]: Nullable<Array<string>>;
    public static readonly [symbols.template]:           Nullable<HTMLTemplateElement>;

    protected readonly [shadowRoot]: ShadowRoot;

    public [symbols.onAttributeChanged]: (attributeName: string, oldValue: string, newValue: string, namespace: string) => void;

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

    /** Called when the element is created or upgraded */
    protected connectedCallback(): void
    { }

    /** Called when the element is inserted into a document, including into a shadow tree */
    protected disconnectedCallback(): void
    { }

    /**
     * Called when an attribute is changed, appended, removed, or replaced on the element.
     * Only called for observed attributes.
     */
    protected attributeChangedCallback(attributeName: string, oldValue: string, newValue: string, namespace: string): void
    {
        if (attributeName in this.style)
        {
            this.style[attributeName] = newValue;
        }

        if (this[symbols.onAttributeChanged])
        {
            this[symbols.onAttributeChanged](attributeName, oldValue, newValue, namespace);
        }
    }

    /** Called when the element is adopted into a new document */
    protected adoptedCallback(oldDocument: Document, newDocument: Document): void
    { }

    /**
     * Returns the all elements that matches the specified name.
     * @param selector Query selector.
     */
    public attachAll<T extends HTMLElement>(selector: string): List<T>;
    /**
     * Returns the all elements that matches the specified pattern.
     * @param selector Query pattern.
     */
    public attachAll<T extends HTMLElement>(selector: RegExp): List<T>;
    /**
     * Returns the all elements that matches the specified name at the specified slot.
     * @param selector Query selector.
     * @param slotName Slot name.
     */
    public attachAll<T extends HTMLElement>(selector: string, slotName: string): List<T>;
    /**
     * Returns the all elements that matches the specified pattern at the specified slot.
     * @param selector Query pattern.
     * @param slotName Slot name.
     */
    public attachAll<T extends HTMLElement>(selector: RegExp, slotName: string): List<T>;
    public attachAll<T extends HTMLElement>(selector: string|RegExp, slotName?: string): List<T>
    {
        let slots = this[shadowRoot]
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
            return this[shadowRoot].querySelectorAll("*")
                .asEnumerable()
                .cast<HTMLElement>()
                .where(x => !!x.tagName.toLowerCase().match(selector))
                .cast<T>()
                .toList();
        }
        else
        {
            return this[shadowRoot].querySelectorAll(selector).asEnumerable().cast<T>().toList();
        }
    }

    /**
     * Returns the first element that matches the specified selector.
     * @param selector Query selector.
     */
    public attach<T extends HTMLElement>(selector: string): T;
    /**
     * Returns the first element that matches the specified pattern.
     * @param selector Query pattern.
     */
    public attach<T extends HTMLElement>(selector: RegExp): T;
    /**
     * Returns the first element that matches the specified name at the specified slot.
     * @param selector Query selector.
     * @param slotName Slot name.
     */
    public attach<T extends HTMLElement>(selector: string, slotName: string): T;
    /**
     * Returns the first element that matches the specified pattern at the specified slot.
     * @param selector Query pattern.
     * @param slotName Slot name.
     */
    public attach<T extends HTMLElement>(selector: RegExp, slotName: string): T;
    public attach<T extends HTMLElement>(selector: string|RegExp, slotName?: string): T
    {
        // tslint:disable-next-line:no-any
        return this.attachAll<T>(selector as any, slotName as any).first();
    }
}