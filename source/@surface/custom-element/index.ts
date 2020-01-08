import { Action, Indexer, KeyValue, Nullable }               from "@surface/core";
import Reactive                                              from "@surface/reactive";
import ICustomElement                                        from "./interfaces/custom-element";
import References                                            from "./internal/references";
import { OBSERVED_ATTRIBUTES, SCOPE, SHADOW_ROOT, TEMPLATE } from "./internal/symbols";
import TemplateProcessor                                     from "./internal/template-processor";

export default abstract class CustomElement extends HTMLElement implements ICustomElement
{
    public static readonly [OBSERVED_ATTRIBUTES]: Nullable<Array<string>>;
    public static readonly [TEMPLATE]:            Nullable<HTMLTemplateElement>;

    private [SCOPE]: Indexer = { };
    private readonly [SHADOW_ROOT]: ShadowRoot;
    private readonly _references:   References;

    protected get context(): Indexer
    {
        return this[SCOPE];
    }

    public get references(): References
    {
        return this._references;
    }

    public onAfterBind?: Action;

    public constructor();
    public constructor(shadowRootInit: ShadowRootInit);
    public constructor(shadowRootInit?: ShadowRootInit)
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
     * Process node tree directives
     * @param content Node tree to be processed
     * @param context Context utilized to resolve expressions
     */
    protected static processDirectives(host: Node, content: Node, context: Indexer): void
    {
        TemplateProcessor.process(host, content, context);
    }

    /**
     * Remove binds reference of node tree.
     * @param content Node tree to be unbinded
     */
    protected static clearDirectives(node: Node): void;
    protected static clearDirectives(childNodes: NodeListOf<ChildNode>): void;
    protected static clearDirectives(nodeOrChildNodes: Node|NodeListOf<ChildNode>): void
    {
        if (nodeOrChildNodes instanceof NodeList)
        {
            nodeOrChildNodes.forEach(x => TemplateProcessor.clear(x));
        }
        else
        {
            TemplateProcessor.clear(nodeOrChildNodes);
        }
    }

    private applyTemplate(template: HTMLTemplateElement): void
    {
        const content = document.importNode(template.content, true);

        content.normalize();

        this[SHADOW_ROOT].appendChild(content);
    }

    /**
     * Notify property change.
     * @param key Property key
     */
    protected notify<K extends keyof this>(key: K)
    {
        const reactor = Reactive.getReactor(this as unknown as Indexer);

        if (reactor)
        {
            reactor.notify(this as unknown as Indexer, key as keyof Indexer);
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