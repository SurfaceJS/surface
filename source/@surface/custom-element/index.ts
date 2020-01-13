import { Action, Indexer }                     from "@surface/core";
import Reactive                                from "@surface/reactive";
import ICustomElement                          from "./interfaces/custom-element";
import References                              from "./internal/references";
import { SCOPE, SHADOW_ROOT, STATIC_METADATA } from "./internal/symbols";
import TemplateProcessor                       from "./internal/template-processor";
import { StaticMetadata }                      from "./internal/types";

export default abstract class CustomElement extends HTMLElement implements ICustomElement
{
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

    public constructor(shadowRootInit?: ShadowRootInit)
    {
        super();

        this[SHADOW_ROOT] = this.attachShadow(shadowRootInit ?? { mode: "closed" });

        const metadata = (this.constructor as Function & { [STATIC_METADATA]?: StaticMetadata })[STATIC_METADATA];

        if (metadata?.template)
        {
            this.applyTemplate(metadata.template);
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
        Reactive.getReactor(this)?.notify(this, key);
    }
}