import { Constructor, HookableMetadata } from "@surface/core";
import directiveRegistry                 from "./directive-registry";
import ICustomElement                    from "./interfaces/custom-element";
import Metadata                          from "./metadata/metadata";
import StaticMetadata                    from "./metadata/static-metadata";
import { TEMPLATEABLE }                  from "./symbols";
import { DirectiveHandlerRegistry }      from "./types";

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
        const staticMetadata = StaticMetadata.of(instance.constructor)!;

        instance.attachShadow(staticMetadata.shadowRootInit);

        (instance.shadowRoot as { adoptedStyleSheets?: CSSStyleSheet[] }).adoptedStyleSheets = staticMetadata.styles;

        const content = staticMetadata.template.content.cloneNode(true);

        instance.shadowRoot.appendChild(content);

        HookableMetadata.of(this.constructor as Constructor<HTMLElement>)?.initialize(instance);
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

            public dispose(): void
            {
                Metadata.of(this)!.dispose();
            }
        };
    }

    public static registerDirective(...registries: DirectiveHandlerRegistry[]): void
    {
        for (const registry of registries)
        {
            directiveRegistry.set(registry.name, registry.handler);
        }
    }

    public dispose(): void
    {
        Metadata.of(this)!.dispose();
    }
}