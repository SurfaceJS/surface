import "./extensions";
import "@surface/collection/extensions";
import "@surface/enumerable/extensions";

import { ElementBinder }      from "./element-binder";
import { onAttributeChanged } from "./symbols";

import { List }     from "@surface/collection";
import { Nullable } from "@surface/types";

export abstract class CustomElement extends HTMLElement
{
    private _template: Nullable<HTMLTemplateElement>;
    public get template(): Nullable<HTMLTemplateElement>
    {
		return this._template;
	}

    public set template(value: Nullable<HTMLTemplateElement>)
    {
		this._template = value;
	}

    public constructor()
    {
        super();
        this.applyTemplate();
    }

    private applyTemplate(): void
    {
        if (window.ShadyCSS)
        {
            window.ShadyCSS.styleElement(this);
        }

        if (this._template)
        {
            let content = document.importNode(this._template.content, true);
            this.applyDateBind(content);
            this.attachShadow({ mode: "open" }).appendChild(content);
        }
    }

    private applyDateBind(content: Node): void
    {
        new ElementBinder(this, content).bind();
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

        if (this[onAttributeChanged])
        {
            this[onAttributeChanged](attributeName, oldValue, newValue, namespace);
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
        if (this.shadowRoot)
        {
            let slots = this.shadowRoot
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
                return this.shadowRoot.querySelectorAll("*")
                    .asEnumerable()
                    .cast<HTMLElement>()
                    .where(x => !!x.tagName.toLowerCase().match(selector))
                    .cast<T>()
                    .toList();
            }
            else
            {
                return this.shadowRoot.querySelectorAll(selector).asEnumerable().cast<T>().toList();
            }
        }
        else
        {
            throw new Error("Element don\"t has shadowRoot");
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
        return this.attachAll.call(this, selector, slotName);
    }
}