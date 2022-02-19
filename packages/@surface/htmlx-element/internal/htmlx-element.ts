/* eslint-disable import/named */
import type { Constructor, Delegate }                  from "@surface/core";
import { DisposableMetadata, HookableMetadata }        from "@surface/core";
import type { DirectiveConstructor, DirectiveFactory } from "@surface/htmlx";
import { Metadata as HTMLXMetada }                     from "@surface/htmlx";
import Observer                                        from "@surface/observer";
import type IHTMLXElement                              from "./interfaces/htmlx-element";
import Metadata                                        from "./metadata/metadata.js";
import StaticMetadata                                  from "./metadata/static-metadata.js";
import { directivesRegistry }                          from "./singletons.js";

const HTMLX_ELEMENT = Symbol("htmlx-element:instance");

export default class HTMLXElement extends HTMLElement implements IHTMLXElement
{

    public static readonly [HTMLX_ELEMENT]: boolean = true;

    public get $injections(): string[]
    {
        return Array.from(HTMLXMetada.from(this).injections.keys());
    }

    public get $listeners(): Record<string, Delegate>
    {
        return Object.fromEntries(HTMLXMetada.from(this).listeners);
    }

    public shadowRoot!: ShadowRoot;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public constructor()
    {
        super();

        HTMLXElement.applyMetadata(this);
    }

    private static applyMetadata(instance: HTMLElement & { shadowRoot: ShadowRoot }): void
    {
        const htmlxMetadata      = HTMLXMetada.from(instance);
        const disposableMetadata = DisposableMetadata.from(instance);

        const injectionsSubscription = htmlxMetadata.injections.subscribe(() => Observer.notifyAll(instance, "$injections"));
        const listenersSubscription  = htmlxMetadata.listeners.subscribe(() => Observer.notifyAll(instance, "$listeners"));

        disposableMetadata.add({ dispose: () => injectionsSubscription.unsubscribe() });
        disposableMetadata.add({ dispose: () => listenersSubscription.unsubscribe() });

        const staticMetadata = StaticMetadata.from(instance.constructor);

        instance.attachShadow(staticMetadata.shadowRootInit);

        (instance.shadowRoot as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets = staticMetadata.styles;

        const hookableMetadata = HookableMetadata.from(instance.constructor as Constructor<HTMLElement>);

        if (staticMetadata.template)
        {
            const { content, activator } = staticMetadata.template.create();

            instance.shadowRoot.appendChild(content);

            Metadata.from(instance).activator = activator;
        }

        hookableMetadata.initialize(instance);
    }

    public static [Symbol.hasInstance](instance: object): boolean
    {
        return Reflect.get(instance.constructor, HTMLX_ELEMENT);
    }

    /**
     * Extends a HTML element.
     * @param base Element to be extended.
     */
    public static as<T extends Constructor<HTMLElement>>(base: T): T & Constructor<IHTMLXElement>
    {
        return class HTMLXElementExtends extends base implements IHTMLXElement
        {
            public static readonly [HTMLX_ELEMENT]: boolean = true;

            public shadowRoot!: ShadowRoot;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            public constructor(...args: any[])
            {
                super(...args);

                HTMLXElement.applyMetadata(this);
            }

            public dispose(): void
            {
                DisposableMetadata.from(this).dispose();
            }
        };
    }

    /**
     * Registers a custom directive.
     * @param name Custom directive name.
     * @param handler An directive constructor or factory.
     */
    public static registerDirective(name: string, handler: DirectiveConstructor | DirectiveFactory): void
    {
        directivesRegistry.set(name, handler);
    }

    /** Disposes resources. */
    public dispose(): void
    {
        DisposableMetadata.from(this).dispose();
    }
}