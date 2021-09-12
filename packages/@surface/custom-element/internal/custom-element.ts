import type { Constructor }                            from "@surface/core";
import { DisposableMetadata, HookableMetadata }        from "@surface/core";
import type ICustomElement                             from "./interfaces/custom-element";
import Metadata                                        from "./metadata/metadata.js";
import StaticMetadata                                  from "./metadata/static-metadata.js";
import { globalCustomDirectives }                      from "./singletons.js";
import type { DirectiveConstructor, DirectiveFactory } from "./types/directive-entry.js";

const CUSTOM_ELEMENT = Symbol("custom-element:instance");

export default class CustomElement extends HTMLElement implements ICustomElement
{
    public static readonly [CUSTOM_ELEMENT]: boolean = true;

    public shadowRoot!: ShadowRoot;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public constructor()
    {
        super();

        CustomElement.applyMetadata(this);
    }

    private static applyMetadata(instance: HTMLElement & { shadowRoot: ShadowRoot }): void
    {
        const staticMetadata = StaticMetadata.from(instance.constructor);

        instance.attachShadow(staticMetadata.shadowRootInit);

        (instance.shadowRoot as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets = staticMetadata.styles;

        const hookableMetadata = HookableMetadata.from(instance.constructor as Constructor<HTMLElement>);

        if (staticMetadata.factory)
        {
            const [content, activator] = staticMetadata.factory();

            instance.shadowRoot.appendChild(content);

            Metadata.from(instance).activator = activator;
        }

        hookableMetadata.initialize(instance);
    }

    public static [Symbol.hasInstance](instance: object): boolean
    {
        return Reflect.get(instance.constructor, CUSTOM_ELEMENT);
    }

    /**
     * Extends a HTML element.
     * @param base Element to be extended.
     */
    public static as<T extends Constructor<HTMLElement>>(base: T): T & Constructor<ICustomElement>
    {
        return class CustomElementExtends extends base implements ICustomElement
        {
            public static readonly [CUSTOM_ELEMENT]: boolean = true;

            public shadowRoot!: ShadowRoot;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            public constructor(...args: any[])
            {
                super(...args);

                CustomElement.applyMetadata(this);
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
        globalCustomDirectives.set(name, handler);
    }

    /** Disposes resources. */
    public dispose(): void
    {
        DisposableMetadata.from(this).dispose();
    }
}