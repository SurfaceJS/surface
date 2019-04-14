import { Action, Indexer, KeyValue, Nullable }                 from "@surface/core";
import Reactive                                                from "@surface/reactive";
import ElementBind                                             from "./internal/element-bind";
import References                                              from "./internal/references";
import { CONTEXT, OBSERVED_ATTRIBUTES, SHADOW_ROOT, TEMPLATE } from "./internal/symbols";

export default abstract class CustomElement extends HTMLElement
{
    public static readonly [OBSERVED_ATTRIBUTES]: Nullable<Array<string>>;
    public static readonly [TEMPLATE]:            Nullable<HTMLTemplateElement>;

    private [CONTEXT]: Indexer = { };
    private readonly [SHADOW_ROOT]: ShadowRoot;
    private readonly _references:   References;

    protected get context(): Indexer
    {
        return this[CONTEXT];
    }

    public get references(): References
    {
        return this._references;
    }

    public onAfterBind?: Action;

    protected constructor();
    protected constructor(shadowRootInit: ShadowRootInit);
    protected constructor(shadowRootInit?: ShadowRootInit)
    {
        super();
        this[SHADOW_ROOT] = this.attachShadow(shadowRootInit || { mode: "closed" });

        const template = (this.constructor as typeof CustomElement)[TEMPLATE];

        if (template)
        {
            this.applyTemplate(template);
        }

        this._references = new References(this[SHADOW_ROOT]);
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

    protected applySlottedTemplate(name?: string): void
    {
        type ScopedHTMLSlotElement = HTMLSlotElement & { scope?: Indexer };

        const slot = this[SHADOW_ROOT].querySelector<ScopedHTMLSlotElement>(`slot${name ? `[name=${name}]` : ""}`);

        if (slot && "scope" in slot)
        {
            const element = slot.assignedElements()[0];

            if (element && element.tagName == "TEMPLATE")
            {
                const content = document.importNode((element as HTMLTemplateElement).content, true);

                const alias = element.getAttribute("scope") || "scope";

                for (const element of Array.from(content.children) as Array<HTMLElement>)
                {
                    element.slot = name || "";
                }

                this.appendChild(content);

                CustomElement.contextBind({ ...this.context, [alias]: slot.scope }, this);
            }
        }
        else
        {
            throw new Error();
        }
    }

    /**
     * Notify property change.
     * @param key Property key
     */
    protected notify<K extends keyof this>(key: K)
    {
        const reactor = Reactive.getReactor(this);

        if (reactor)
        {
            reactor.notify(this, key);
        }
    }

    /**
     * Set value to especified object property.
     * @param target Object instance
     * @param key    Property key
     * @param value  Value to set
     */
    protected set<T extends object, K extends keyof T>(target: T, key: K, value: T[K]): void;
    /**
     * Set value to this intance property.
     * @param key   Property key
     * @param value Value to set
     */
    protected set<K extends keyof this>(key: K, value: this[K]): void;
    protected set<T extends object, K extends keyof T>(...args: KeyValue<this>|[T, K, T[K]]): void
    {
        if (args.length == 2)
        {
            const [key, value] = args;
            this[key] = value;
        }
        else
        {
            const [target, key, value] = args;
            target[key] = value;
        }
    }
}