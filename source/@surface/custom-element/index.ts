import { Action, KeyValue, Nullable }                          from "@surface/core";
import Reactive                                                from "@surface/reactive";
import ElementBind                                             from "./internal/element-bind";
import References                                              from "./internal/references";
import { CONTEXT, OBSERVED_ATTRIBUTES, SHADOW_ROOT, TEMPLATE } from "./internal/symbols";

export default abstract class CustomElement extends HTMLElement
{
    public static readonly [OBSERVED_ATTRIBUTES]: Nullable<Array<string>>;
    public static readonly [TEMPLATE]:            Nullable<HTMLTemplateElement>;

    private [CONTEXT]: unknown;
    private readonly [SHADOW_ROOT]: ShadowRoot;
    private readonly _references:   References;

    protected get context(): object
    {
        return (this[CONTEXT] || { }) as object;
    }

    public get references(): References
    {
        return this._references;
    }

    public bindedCallback?: Action;

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