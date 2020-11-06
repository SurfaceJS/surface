import { Constructor, assert }      from "@surface/core";
import directiveRegistry            from "./directive-registry";
import ICustomElement               from "./interfaces/custom-element";
import StaticMetadata               from "./metadata/static-metadata";
import { TEMPLATEABLE }             from "./symbols";
import { DirectiveHandlerRegistry } from "./types";

export default class CustomElement extends HTMLElement implements ICustomElement
{
    public static readonly [TEMPLATEABLE]: boolean = true;

    public shadowRoot!: ShadowRoot;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public constructor()
    {
        super();

        CustomElement.applyMetadata(this);
    }

    private static applyMetadata(instance: HTMLElement & { shadowRoot: ShadowRoot }): void
    {
        instance.attachShadow({ mode: "open" });

        const metadata = StaticMetadata.from(instance.constructor);

        assert(metadata?.styles);
        assert(metadata?.template);

        (instance.shadowRoot as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets = metadata.styles;

        const content = metadata.template.content.cloneNode(true);

        instance.shadowRoot.appendChild(content);
    }

    public static as<T extends Constructor<HTMLElement>>(base: T): T & Constructor<ICustomElement>
    {
        return class CustomElementExtends extends base implements ICustomElement
        {
            public static readonly [TEMPLATEABLE]: boolean = true;

            public shadowRoot!: ShadowRoot;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            public constructor(...args: any[])
            {
                super(...args);

                CustomElement.applyMetadata(this);
            }
        };
    }

    public static registerDirective(registry: DirectiveHandlerRegistry): void
    {
        directiveRegistry.set(registry.name, registry.handler);
    }
}