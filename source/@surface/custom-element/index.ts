import { Action, Indexer, KeyValue, Nullable }                             from "@surface/core";
import Reactive                                                            from "@surface/reactive";
import { CONTEXT, OBSERVED_ATTRIBUTES, REFERENCES, SHADOW_ROOT, TEMPLATE } from "./internal/symbols";
import TemplateProcessor                                                   from "./internal/template-processor";
import References                                                          from "./internal/References";



export default abstract class CustomElement extends HTMLElement
{
    public static readonly [OBSERVED_ATTRIBUTES]: Nullable<Array<string>>;
    public static readonly [TEMPLATE]:            Nullable<HTMLTemplateElement>;

    protected readonly [SHADOW_ROOT]: ShadowRoot;

    protected [CONTEXT]!:    Indexer;
    protected [REFERENCES]!: References;

    protected get context(): Indexer
    {
        return this[CONTEXT];
    }

    public get references(): Record<string, Nullable<HTMLElement>>
    {
        return this[REFERENCES] as unknown as Record<string, HTMLElement|null>;
    }

    public onAfterBind?: Action;

    protected constructor();
    protected constructor(shadowRootInit: ShadowRootInit);
    protected constructor(shadowRootInit?: ShadowRootInit)
    {
        super();
        this[SHADOW_ROOT] = this.attachShadow(shadowRootInit || { mode: "closed" });

        //const template = (this.constructor as typeof CustomElement)[TEMPLATE];

        //if (template)
        //{
        //    this.applyTemplate(template);
        //}
    }

    /**
     * Process node tree directives
     * @param content Node tree to be processed
     * @param context Context utilized to resolve expressions
     */
    protected static processDirectives(host: Node|Element, content: Node, context: Indexer): void
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

    // private applyTemplate(template: HTMLTemplateElement): void
    // {
    //     const content = document.importNode(template.content, true);

    //     content.normalize();

    //     this[SHADOW_ROOT].appendChild(content);
    // }

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