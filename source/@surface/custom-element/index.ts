import "@surface/collection/extensions";
import "@surface/enumerable/extensions";
import "./extensions";

import List         from "@surface/collection/list";
import { Nullable } from "@surface/types";
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
    public find<T extends HTMLElement>(selector: string): T;
    /**
     * Returns the first element that matches the specified pattern.
     * @param selector Query pattern.
     */
    public find<T extends HTMLElement>(selector: RegExp): T;
    /**
     * Returns the first element that matches the specified name at the specified slot.
     * @param selector Query selector.
     * @param slotName Slot name.
     */
    public find<T extends HTMLElement>(selector: string, slotName: string): T;
    /**
     * Returns the first element that matches the specified pattern at the specified slot.
     * @param selector Query pattern.
     * @param slotName Slot name.
     */
    public find<T extends HTMLElement>(selector: RegExp, slotName: string): T;
    public find<T extends HTMLElement>(selector: string|RegExp, slotName?: string): T
    {
        // tslint:disable-next-line:no-any
        return this.findAll<T>(selector as any, slotName as any).first();
    }

    /**
     * Returns the all elements that matches the specified name.
     * @param selector Query selector.
     */
    public findAll<T extends HTMLElement>(selector: string): List<T>;
    /**
     * Returns the all elements that matches the specified pattern.
     * @param selector Query pattern.
     */
    public findAll<T extends HTMLElement>(selector: RegExp): List<T>;
    /**
     * Returns the all elements that matches the specified name at the specified slot.
     * @param selector Query selector.
     * @param slotName Slot name.
     */
    public findAll<T extends HTMLElement>(selector: string, slotName: string): List<T>;
    /**
     * Returns the all elements that matches the specified pattern at the specified slot.
     * @param selector Query pattern.
     * @param slotName Slot name.
     */
    public findAll<T extends HTMLElement>(selector: RegExp, slotName: string): List<T>;
    public findAll<T extends HTMLElement>(selector: string|RegExp, slotName?: string): List<T>
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
}